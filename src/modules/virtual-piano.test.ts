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
        expect(keys.length).toBe(12); // Single octave

        // Check for specific keys (C4)
        const c4 = container.querySelector('[data-note="C"][data-octave="4"]');
        expect(c4).not.toBeNull();
        expect(c4?.classList.contains('white')).toBe(true);

        const cSharp4 = container.querySelector('[data-note="C#"][data-octave="4"]');
        expect(cSharp4).not.toBeNull();
        expect(cSharp4?.classList.contains('black')).toBe(true);
    });

    it('should toggle notes on click', () => {
        piano.render('piano-container');
        const key = container.querySelector('[data-note="C"][data-octave="4"]') as HTMLElement;

        // First click: Activate
        key.dispatchEvent(new MouseEvent('mousedown'));
        expect(callback).toHaveBeenCalledWith('C', true);
        expect(key.classList.contains('active')).toBe(true);

        // Second click: Deactivate
        key.dispatchEvent(new MouseEvent('mousedown'));
        expect(callback).toHaveBeenCalledWith('C', false);
        expect(key.classList.contains('active')).toBe(false);
    });

    it('should update visual state based on canonical note', () => {
        piano.render('piano-container');
        const c4 = container.querySelector('[data-note="C"][data-octave="4"]') as HTMLElement;

        // Since we only have one octave now, this test is simplified to just check if interaction works
        c4.dispatchEvent(new MouseEvent('mousedown'));

        expect(c4.classList.contains('active')).toBe(true);
    });

    it('should return contextually correct note name', () => {
        piano.render('piano-container');
        piano.setKeyContext('Eb', 'Minor');

        // B in Eb Minor is Cb
        const bKey = container.querySelector('[data-note="B"][data-octave="4"]') as HTMLElement;

        bKey.dispatchEvent(new MouseEvent('mousedown'));

        expect(callback).toHaveBeenCalledWith('Cb', true);
        expect(bKey.classList.contains('active')).toBe(true);
    });

    it('should clear all active notes', () => {
        piano.render('piano-container');
        const key = container.querySelector('[data-note="C"][data-octave="4"]') as HTMLElement;

        key.dispatchEvent(new MouseEvent('mousedown'));
        expect(key.classList.contains('active')).toBe(true);

        piano.clear();
        expect(key.classList.contains('active')).toBe(false);
    });
});
