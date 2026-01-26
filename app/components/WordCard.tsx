interface WordCardProps {word:string,
                         guessedLetters: Set<string>
}

export default function WordCard({word, guessedLetters}:WordCardProps) {
    return (
        <div>
            {word.split("").map((letter,index) => {
                const isGuessed = guessedLetters.has(letter.toLowerCase())
                return (<p key={index}>{isGuessed?letter:"_"}</p>)
            } )}
        </div>

    )

}