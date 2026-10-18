import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/App.tsx';
import './ui/styles.css';
import './ui/classicLayout.css';
import './ui/classicStage.css';
import './ui/PlayerPolish.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing application root');
const ArtRegression = import.meta.env.DEV && new URLSearchParams(window.location.search).get('artRegression') === '1' ? lazy(() => import('./ui/ArtRegression.tsx')) : null;
createRoot(root).render(<StrictMode>{ArtRegression ? <Suspense fallback={null}><ArtRegression /></Suspense> : <App />}</StrictMode>);
