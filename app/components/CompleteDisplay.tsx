import { example } from '@/app/types/database';
interface CompleteDisplayProps {word: string,
                                meaning: string,
                                examples: example[],
                                failed?: boolean

}

export default function CompleteDisplay({word, meaning, examples, failed}: CompleteDisplayProps) {
    console.log(examples)
    return (<div>
           <p>{failed?"Practice makes progress. Remeber to play this game every day to see results!":"Congrats. You guessed the word!"}</p> 
           <div>
            <h1>{`The meaning of ${word}`}</h1>
            <p>{meaning}</p>
           </div>
           {examples.length > 0 && 
           (<div>
            <h1>Examples for the word</h1>
            <ul>
                {examples.map((example) => (
                    <div key={example.id}>
                    <li>{example.example_standard}</li>
                    <li>{example.example_funny}</li>
                    </div>))}
                    
            </ul>
            </div>)}

           </div>)
}