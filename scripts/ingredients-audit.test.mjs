import test from 'node:test';import assert from 'node:assert/strict';import { ingredientPacing } from './ingredients-audit.mjs';
test('configured ingredient prices follow real 2K saving pace and preserve a meaningful spend choice',()=>{
  assert.deepEqual(ingredientPacing(),[
    {id:'botanical',published:true,level:3,price:100,saveRounds:{basso:10,medio:4,alto:3},midRoundsAfterEffect:10},
    {id:'ember',published:true,level:4,price:175,saveRounds:{basso:16,medio:7,alto:5},midRoundsAfterEffect:13},
    {id:'blossom',published:true,level:5,price:225,saveRounds:{basso:21,medio:10,alto:7},midRoundsAfterEffect:15},
  ]);
});
