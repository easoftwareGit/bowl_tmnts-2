import { shuffleArray } from "@/lib/tools";

describe('shuffleArray function', () => {
    
  it('should shuffle an array but keep the same elements', () => {
    const originalArray = [1, 2, 3, 4, 5];
    const arr = [...originalArray]; // Copy original array
    shuffleArray(arr);

    expect(arr).toEqual(expect.arrayContaining(originalArray)); // Ensure all original elements exist
    expect(arr).not.toEqual(originalArray); // Should be shuffled
  });

  it('should not modify the array length', () => {
    const arr = [10, 20, 30, 40];
    const originalLength = arr.length;
    shuffleArray(arr);

    expect(arr.length).toBe(originalLength);
  });

  it('should return immediately for an empty array', () => {
    const arr: number[] = [];
    shuffleArray(arr);

    expect(arr).toEqual([]); // No changes should be made
  });

  it('should return immediately for a single-element array', () => {
    const arr = [42];
    shuffleArray(arr);

    expect(arr).toEqual([42]); // A single element can't be shuffled
  });

  it('should handle array of strings', () => {
    const originalArray = ['a', 'b', 'c', 'd'];
    const arr = [...originalArray];
    shuffleArray(arr);

    expect(arr).toEqual(expect.arrayContaining(originalArray));
    expect(arr).not.toEqual(originalArray);
  });
});