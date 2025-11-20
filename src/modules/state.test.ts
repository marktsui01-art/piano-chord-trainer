import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateManager } from './state';

describe('StateManager', () => {
    let stateManager: StateManager;

    beforeEach(() => {
        stateManager = new StateManager();
    });

    describe('initial state', () => {
        it('should start in lesson mode', () => {
            const state = stateManager.getState();
            expect(state.mode).toBe('lesson');
        });

        it('should start with triads module', () => {
            const state = stateManager.getState();
            expect(state.module).toBe('triads');
        });
    });

    describe('setMode', () => {
        it('should change mode to drill', () => {
            stateManager.setMode('drill');
            const state = stateManager.getState();
            expect(state.mode).toBe('drill');
        });

        it('should notify subscribers when mode changes', () => {
            const listener = vi.fn();
            stateManager.subscribe(listener);

            // Clear the initial subscription call
            listener.mockClear();

            stateManager.setMode('drill');
            expect(listener).toHaveBeenCalledWith(
                expect.objectContaining({ mode: 'drill' })
            );
        });

        it('should not notify subscribers if mode does not change', () => {
            const listener = vi.fn();
            stateManager.subscribe(listener);
            listener.mockClear();

            stateManager.setMode('lesson'); // Already in lesson mode
            expect(listener).not.toHaveBeenCalled();
        });
    });

    describe('setModule', () => {
        it('should change module to sevenths', () => {
            stateManager.setModule('sevenths');
            const state = stateManager.getState();
            expect(state.module).toBe('sevenths');
        });

        it('should notify subscribers when module changes', () => {
            const listener = vi.fn();
            stateManager.subscribe(listener);
            listener.mockClear();

            stateManager.setModule('sevenths');
            expect(listener).toHaveBeenCalledWith(
                expect.objectContaining({ module: 'sevenths' })
            );
        });
    });

    describe('subscribe', () => {
        it('should call listener immediately upon subscription', () => {
            const listener = vi.fn();
            stateManager.subscribe(listener);

            expect(listener).toHaveBeenCalledWith(
                expect.objectContaining({ mode: 'lesson', module: 'triads' })
            );
        });

        it('should support multiple subscribers', () => {
            const listener1 = vi.fn();
            const listener2 = vi.fn();

            stateManager.subscribe(listener1);
            stateManager.subscribe(listener2);

            listener1.mockClear();
            listener2.mockClear();

            stateManager.setMode('drill');

            expect(listener1).toHaveBeenCalled();
            expect(listener2).toHaveBeenCalled();
        });
    });

    describe('getState', () => {
        it('should return a copy of the state', () => {
            const state1 = stateManager.getState();
            const state2 = stateManager.getState();

            expect(state1).toEqual(state2);
            expect(state1).not.toBe(state2); // Different objects
        });
    });
});
