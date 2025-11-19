import Vex from 'vexflow';

export class NotationRenderer {
    private divId: string;
    private renderer: Vex.Flow.Renderer | null = null;
    private context: Vex.IRenderContext | null = null;

    constructor(divId: string) {
        this.divId = divId;
    }

    public render(notes: string[], clef: 'treble' | 'bass' = 'treble') {
        const div = document.getElementById(this.divId);
        if (!div) return;

        div.innerHTML = ''; // Clear previous

        const VF = Vex.Flow;
        this.renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
        this.renderer.resize(300, 200);
        this.context = this.renderer.getContext();

        const stave = new VF.Stave(10, 40, 250);
        stave.addClef(clef);
        stave.setContext(this.context).draw();

        if (notes.length === 0) return;

        // Convert notes to VexFlow StaveNotes
        // Input format expected: "C/4", "E/4", "G/4"
        const staveNotes = [
            new VF.StaveNote({ clef: clef, keys: notes, duration: "w" })
        ];

        const voice = new VF.Voice({ num_beats: 4, beat_value: 4 });
        voice.addTickables(staveNotes);

        new VF.Formatter().joinVoices([voice]).format([voice], 200);
        voice.draw(this.context, stave);
    }
}
