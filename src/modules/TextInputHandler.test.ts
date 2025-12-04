// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TextInputHandler } from './TextInputHandler';

describe('TextInputHandler', () => {
    let handler: TextInputHandler;
    let callback: any;

    beforeEach(() => {
        vi.useFakeTimers();
        callback = vi.fn();
        handler = new TextInputHandler(callback, 1000); // 1 second delay
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should debounce single character input', () => {
        handler.handleInput('C');
        expect(callback).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1100);
        expect(callback).toHaveBeenCalledWith(['C']);
    });

    it('should combine multiple characters within delay', () => {
        handler.handleInput('E');

        // Advance partial time (100ms vs 1000ms delay)
        vi.advanceTimersByTime(100);
        expect(callback).not.toHaveBeenCalled();

        handler.handleInput('b'); // Eb (Complete note, flushes immediately)

        expect(callback).toHaveBeenCalledWith(['Eb']);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should flush immediately on space', () => {
        handler.handleInput('F');
        handler.handleInput(' '); // Space

        expect(callback).toHaveBeenCalledWith(['F']);

        vi.advanceTimersByTime(1100);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should handle space as separator for sequential quick input', () => {
        handler.handleInput('C');
        handler.handleInput(' ');
        expect(callback).toHaveBeenLastCalledWith(['C']);

        handler.handleInput('E');
        vi.advanceTimersByTime(1100);
        expect(callback).toHaveBeenLastCalledWith(['E']);
    });

    it('should flush immediately when accidental is entered', () => {
        handler.handleInput('F');
        expect(callback).not.toHaveBeenCalled();

        handler.handleInput('#');
        expect(callback).toHaveBeenCalledWith(['F#']);
    });
});
