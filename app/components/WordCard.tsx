import styles from "./WordCard.module.css";

interface WordCardProps {word:string,
                         guessedLetters: Set<string>
}

export default function WordCard({word, guessedLetters}:WordCardProps) {

    return (
  <div className={styles.wordRow}>
    {word.split("").map((letter, index) => {
      const isGuessed = guessedLetters.has(letter.toUpperCase());
      return <span key={index} className={styles.letter}>{isGuessed ? letter.toUpperCase() : "_"}</span>;
    })}
  </div>
)
    // return (
    //     <div>
    //         {word.split("").map((letter,index) => {
    //             const isGuessed = guessedLetters.has(letter.toUpperCase())
    //             return (<p key={index}>{isGuessed?letter:"_"}</p>)
    //         } )}
    //     </div>

    // )

}