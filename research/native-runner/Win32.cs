using System;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
// REFERENCE_NATIVE_RESEARCH_ONLY. No VM/ActionScript access.
public static class ReferenceNative {
  [StructLayout(LayoutKind.Sequential)] public struct Point { public int X,Y; }
  [StructLayout(LayoutKind.Sequential)] public struct Rect { public int Left,Top,Right,Bottom; }
  [StructLayout(LayoutKind.Sequential)] struct MouseInput { public int X,Y; public uint Data,Flags,Time; public UIntPtr Extra; }
  [StructLayout(LayoutKind.Explicit)] struct InputUnion { [FieldOffset(0)] public MouseInput Mouse; }
  [StructLayout(LayoutKind.Sequential)] struct Input { public uint Type; public InputUnion Union; }
  public class Geometry { public long Handle; public int ProcessId,X,Y,Width,Height; public uint Dpi; public string Title; public bool Foreground; }
  public class Timing { public double DownMs,UpMs,MeasuredHoldMs; public int RequestedHoldMs,ScreenX,ScreenY; public bool Released,ButtonDownObserved,ButtonUpObserved,Started,Aborted; public string AbortReason; public int PhysicalCursorX,PhysicalCursorY; }
  [DllImport("user32.dll")] static extern bool IsWindow(IntPtr h);
  [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] static extern bool IsIconic(IntPtr h);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h,out uint pid);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetWindowText(IntPtr h,StringBuilder s,int max);
  [DllImport("user32.dll")] static extern bool GetClientRect(IntPtr h,out Rect r);
  [DllImport("user32.dll")] static extern bool ClientToScreen(IntPtr h,ref Point p);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("kernel32.dll")] static extern uint GetCurrentThreadId();
  [DllImport("user32.dll")] static extern bool AttachThreadInput(uint from,uint to,bool attach);
  [DllImport("user32.dll")] static extern bool BringWindowToTop(IntPtr h);
  [DllImport("user32.dll")] static extern bool ShowWindow(IntPtr h,int command);
  [DllImport("user32.dll")] static extern uint GetDpiForWindow(IntPtr h);
  [DllImport("user32.dll")] static extern IntPtr SetThreadDpiAwarenessContext(IntPtr context);
  [DllImport("user32.dll")] static extern IntPtr GetAncestor(IntPtr h,uint flag);
  [DllImport("user32.dll")] static extern IntPtr WindowFromPoint(Point p);
  [DllImport("user32.dll")] static extern bool GetCursorPos(out Point p);
  [DllImport("user32.dll")] static extern bool GetPhysicalCursorPos(out Point p);
  [DllImport("user32.dll",SetLastError=true)] static extern bool SetCursorPos(int x,int y);
  [DllImport("user32.dll")] static extern short GetAsyncKeyState(int key);
  [DllImport("user32.dll")] static extern int GetSystemMetrics(int index);
  [DllImport("user32.dll",SetLastError=true)] static extern uint SendInput(uint count,Input[] inputs,int size);
  static readonly Stopwatch Clock=Stopwatch.StartNew();
  public static Timing LastTiming;
  public static IntPtr BeginDpi() { IntPtr previous=SetThreadDpiAwarenessContext(new IntPtr(-4)); if(previous==IntPtr.Zero)throw new InvalidOperationException("DPI unavailable"); return previous; }
  public static void EndDpi(IntPtr previous) { SetThreadDpiAwarenessContext(previous); }
  public static bool DpiSupported() {
    IntPtr previous=SetThreadDpiAwarenessContext(new IntPtr(-4));
    if(previous==IntPtr.Zero) return false;
    SetThreadDpiAwarenessContext(previous);return true;
  }
  static void Abort(string sentinel) {
    if((GetAsyncKeyState(0x1B)&0x8000)!=0 || File.Exists(sentinel)) throw new OperationCanceledException("Emergency abort: Escape or ABORT sentinel");
  }
  public static Geometry Read(long handle,int pid,string title,bool foreground) {
    IntPtr prior=SetThreadDpiAwarenessContext(new IntPtr(-4));
    if(prior==IntPtr.Zero) throw new InvalidOperationException("Per-monitor DPI mapping unavailable");
    try {
      IntPtr h=new IntPtr(handle);uint actual;var s=new StringBuilder(1024);
      if(!IsWindow(h)||!IsWindowVisible(h)||IsIconic(h))throw new InvalidOperationException("Target window absent/hidden/minimized");
      GetWindowThreadProcessId(h,out actual);GetWindowText(h,s,s.Capacity);
      if(actual!=(uint)pid||s.ToString()!=title)throw new InvalidOperationException("Target process/title identity changed");
      bool active=GetAncestor(GetForegroundWindow(),2)==h;
      if(foreground&&!active)throw new InvalidOperationException("Target is not foreground: no input; foreground HWND="+GetForegroundWindow().ToInt64());
      Rect r;Point p=new Point();
      if(!GetClientRect(h,out r)||!ClientToScreen(h,ref p)||r.Right<=0||r.Bottom<=0)throw new InvalidOperationException("Invalid client geometry");
      uint dpi=GetDpiForWindow(h);if(dpi==0)throw new InvalidOperationException("DPI unavailable");
      return new Geometry { Handle=handle,ProcessId=pid,Title=s.ToString(),X=p.X,Y=p.Y,Width=r.Right,Height=r.Bottom,Dpi=dpi,Foreground=active };
    } finally {SetThreadDpiAwarenessContext(prior);}
  }
  public static Geometry Activate(long handle,int pid,string title,string sentinel) {
    Abort(sentinel);Read(handle,pid,title,false);
    ShowWindow(new IntPtr(handle),9);SetForegroundWindow(new IntPtr(handle));
    Thread.Sleep(150);
    if(GetAncestor(GetForegroundWindow(),2)!=new IntPtr(handle)) {
      uint foregroundPid;uint foregroundThread=GetWindowThreadProcessId(GetForegroundWindow(),out foregroundPid);uint currentThread=GetCurrentThreadId();bool attached=false;
      try {if(foregroundThread!=currentThread)attached=AttachThreadInput(currentThread,foregroundThread,true);BringWindowToTop(new IntPtr(handle));SetForegroundWindow(new IntPtr(handle));Thread.Sleep(150);}
      finally {if(attached)AttachThreadInput(currentThread,foregroundThread,false);}
    }
    Abort(sentinel);return Read(handle,pid,title,true);
  }
  static void Same(Geometry initial,Geometry current) {
    if(initial.X!=current.X||initial.Y!=current.Y||initial.Width!=current.Width||initial.Height!=current.Height||initial.Dpi!=current.Dpi)
      throw new InvalidOperationException("Geometry/DPI changed during action");
  }
  static void AtTarget(Geometry g,int x,int y) {
    if(x<0||y<0||x>=g.Width||y>=g.Height)throw new InvalidOperationException("Point outside target client");
    Point p=new Point {X=g.X+x,Y=g.Y+y};
    IntPtr actualRoot=GetAncestor(WindowFromPoint(p),2); if(actualRoot!=new IntPtr(g.Handle))throw new InvalidOperationException("Point covered or mapped incorrectly: expected="+g.Handle+" actual="+actualRoot.ToInt64()+" screen="+p.X+","+p.Y);
  }
  static void PhysicalMove(int x,int y) {
    int left=GetSystemMetrics(76),top=GetSystemMetrics(77),width=GetSystemMetrics(78),height=GetSystemMetrics(79);
    if(width<=0||height<=0)throw new InvalidOperationException("Desktop geometry unavailable");
    Input i=new Input {Type=0,Union=new InputUnion {Mouse=new MouseInput {X=(int)Math.Round((x-left+0.5)*65536.0/width),Y=(int)Math.Round((y-top+0.5)*65536.0/height),Flags=0xC001}}};
    if(SendInput(1,new Input[]{i},Marshal.SizeOf(typeof(Input)))!=1)throw new InvalidOperationException("Mouse move input failed");
  }
  static void Button(uint flag) {
    Input i=new Input {Type=0,Union=new InputUnion {Mouse=new MouseInput {Flags=flag}}};
    if(SendInput(1,new Input[]{i},Marshal.SizeOf(typeof(Input)))!=1)throw new InvalidOperationException("SendInput failed; input outcome unknown");
  }
  public static Timing Hold(long handle,int pid,string title,int x,int y,int duration,string sentinel,Action duringCapture) {
    if(duration<0||duration>15000)throw new ArgumentOutOfRangeException("duration");
    IntPtr prior=SetThreadDpiAwarenessContext(new IntPtr(-4));
    if(prior==IntPtr.Zero)throw new InvalidOperationException("DPI unavailable");
    var result=new Timing {RequestedHoldMs=duration};LastTiming=result;bool down=false,captured=false;
    try {
      Abort(sentinel);Geometry initial=Read(handle,pid,title,true);AtTarget(initial,x,y);
      if((GetAsyncKeyState(1)&0x8000)!=0)throw new InvalidOperationException("Mouse already held");
      if(!SetCursorPos(initial.X+x,initial.Y+y))throw new InvalidOperationException("Cursor move failed");
      PhysicalMove(initial.X+x,initial.Y+y);
      Thread.Sleep(50);Abort(sentinel);Same(initial,Read(handle,pid,title,true));AtTarget(initial,x,y);
      result.ScreenX=initial.X+x;result.ScreenY=initial.Y+y;result.DownMs=Clock.Elapsed.TotalMilliseconds;
      Point physical;GetPhysicalCursorPos(out physical);result.PhysicalCursorX=physical.X;result.PhysicalCursorY=physical.Y;
      Button(2);down=true;result.Started=true;result.ButtonDownObserved=(GetAsyncKeyState(1)&0x8000)!=0;
      while(Clock.Elapsed.TotalMilliseconds-result.DownMs<duration) {
        Abort(sentinel);Same(initial,Read(handle,pid,title,true));AtTarget(initial,x,y);
        Point cursor;GetPhysicalCursorPos(out cursor);
        if(Math.Abs(cursor.X-result.ScreenX)>4||Math.Abs(cursor.Y-result.ScreenY)>4)throw new OperationCanceledException("Cursor moved externally: expected="+result.ScreenX+","+result.ScreenY+" actual="+cursor.X+","+cursor.Y);
        if(!captured && duringCapture!=null && Clock.Elapsed.TotalMilliseconds-result.DownMs>=duration/2.0){duringCapture();captured=true;}
        double left=duration-(Clock.Elapsed.TotalMilliseconds-result.DownMs);
        if(left>2)Thread.Sleep((int)Math.Min(4,left-1));else Thread.SpinWait(100);
      }
      Abort(sentinel);Same(initial,Read(handle,pid,title,true));AtTarget(initial,x,y);
      Button(4);down=false;result.UpMs=Clock.Elapsed.TotalMilliseconds;result.Released=true;result.ButtonUpObserved=(GetAsyncKeyState(1)&0x8000)==0;
      result.MeasuredHoldMs=result.UpMs-result.DownMs;return result;
    } catch(Exception error) { result.Aborted=true;result.AbortReason=error.Message;throw; }
    finally {
      // Release only our own held button to avoid a stuck desktop button after abort.
      if(down){Button(4);result.UpMs=Clock.Elapsed.TotalMilliseconds;result.MeasuredHoldMs=result.UpMs-result.DownMs;result.Released=true;result.ButtonUpObserved=(GetAsyncKeyState(1)&0x8000)==0;}
      SetThreadDpiAwarenessContext(prior);
    }
  }
  public static string Capture(long handle,int pid,string title,string sentinel,string path) {
    Abort(sentinel);Geometry g=Read(handle,pid,title,true);
    AtTarget(g,12,12);AtTarget(g,g.Width-13,12);AtTarget(g,12,g.Height-13);AtTarget(g,g.Width-13,g.Height-13);AtTarget(g,g.Width/2,g.Height/2);
    // Actual pixels are captured by the PowerShell System.Drawing adapter after this validation.
    return path;
  }
}
