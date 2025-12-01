import { KeyMode } from './keys';

export type AppMode = 'lesson' | 'drill';
export type ChordModule = 'triads' | 'sevenths' | 'speed' | 'interval' | 'melody';

export interface AppState {
  mode: AppMode;
  module: ChordModule;
  selectedKeyId: string; // e.g. 'C', 'G'
  selectedMode: KeyMode; // e.g. 'Major', 'Dorian'
}

type StateListener = (state: AppState) => void;

export class StateManager {
  private state: AppState;
  private listeners: StateListener[] = [];

  constructor() {
    this.state = {
      mode: 'lesson',
      module: 'triads',
      selectedKeyId: 'C',
      selectedMode: 'Major'
    };
  }

  public getState(): AppState {
    return { ...this.state };
  }

  public setMode(mode: AppMode) {
    if (this.state.mode !== mode) {
      this.state.mode = mode;
      this.notify();
    }
  }

  public setModule(module: ChordModule) {
    if (this.state.module !== module) {
      this.state.module = module;
      this.notify();
    }
  }

  public setKey(keyId: string) {
    if (this.state.selectedKeyId !== keyId) {
        this.state.selectedKeyId = keyId;
        this.notify();
    }
  }

  public setKeyMode(mode: KeyMode) {
      if (this.state.selectedMode !== mode) {
          this.state.selectedMode = mode;
          this.notify();
      }
  }

  public subscribe(listener: StateListener) {
    this.listeners.push(listener);
    // Notify immediately upon subscription so UI can sync
    listener(this.state);
  }

  private notify() {
    this.listeners.forEach((l) => l(this.state));
  }
}
