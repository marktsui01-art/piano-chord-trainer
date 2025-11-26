// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VirtualPiano } from './virtual-piano';

describe('VirtualPiano', () => {
    let container: HTMLElement;
    let piano: VirtualPiano;
    let callback: any;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = '<div id="piano-container"></div>';
        container = document.getElementById('piano-container')!;
        callback = vi.fn();
        piano = new VirtualPiano(callback);
    });

    it('should render keys into the container', () => {
        piano.render('piano-container');
        const keys = container.querySelectorAll('.piano-key');
        expect(keys.length).toBeGreaterThan(0);

        // Check for specific keys
        const c3 = container.querySelector('[data-note="C"][data-octave="3"]');
        expect(c3).not.toBeNull();
        expect(c3?.classList.contains('white')).toBe(true);

        const cSharp3 = container.querySelector('[data-note="C#"][data-octave="3"]');
        expect(cSharp3).not.toBeNull();
        expect(cSharp3?.classList.contains('black')).toBe(true);
    });

    it('should toggle notes on click', () => {
        piano.render('piano-container');
        const key = container.querySelector('[data-note="C"][data-octave="3"]') as HTMLElement;

        // First click: Activate
        key.dispatchEvent(new MouseEvent('mousedown'));
        expect(callback).toHaveBeenCalledWith('C', true);
        expect(key.classList.contains('active')).toBe(true);

        // Second click: Deactivate
        key.dispatchEvent(new MouseEvent('mousedown'));
        expect(callback).toHaveBeenCalledWith('C', false);
        expect(key.classList.contains('active')).toBe(false);
    });

    it('should update all octaves for the same note', () => {
        piano.render('piano-container');
        const c3 = container.querySelector('[data-note="C"][data-octave="3"]') as HTMLElement;
        const c4 = container.querySelector('[data-note="C"][data-octave="4"]') as HTMLElement;

        // Click C3
        c3.dispatchEvent(new MouseEvent('mousedown'));

        // Both should be active because they represent the same pitch class "C"
        expect(c3.classList.contains('active')).toBe(true);
        expect(c4.classList.contains('active')).toBe(true);
    });

    it('should clear all active notes', () => {
        piano.render('piano-container');
        const key = container.querySelector('[data-note="C"][data-octave="3"]') as HTMLElement;

        key.dispatchEvent(new MouseEvent('mousedown'));
        expect(key.classList.contains('active')).toBe(true);

        piano.clear();
        expect(key.classList.contains('active')).toBe(false);
    });
});
