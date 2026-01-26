interface WordMeaningProps {meaning: string};

export default function WordMeaning({meaning}:WordMeaningProps) {
    return (<div>
            <h1>Meaning of the word</h1>
            <p>{meaning}</p>

           </div>)
}

