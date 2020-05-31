import adder from '../tmp.js'

import jest from 'jest'

jest.mock('fs', ()=>{
    return {
            readFile:()=>{
                return "this doesn't really read file silly";
            }
    }
});

describe("Test Suite", ()=>{
    test("Should add one plus one correctly", ()=>{
        expect(adder(1,1)).toBe(2);
    });
});