// creating a blueprint for each data that will get from the table. we are defining types from supabase schema
export interface profile {id: string, email: string, created_at: string};
export interface word {id: string, word: string, meaning: string, created_at: string};
export interface game_session {id: string, user_id: string, word_id: string, status: boolean, correct_guesses: number, incorrect_guesses: number,}
export interface example {id: string, word_id: string, example_standard: string, example_funny: string}
export interface word_with_examples extends word {examples: example[]}