import styles from "./WordCard.module.css";

interface WordCardProps {word:string,
                         guessedLetters: Set<string>,
                         meaning: string
                        
}


export default function WordCard({word, guessedLetters, meaning}:WordCardProps) {
console.log(meaning)
//     return (
//   <div className={styles.wordRow}>
//     {word.split("").map((letter, index) => {
//       const isGuessed = guessedLetters.has(letter.toUpperCase());
//       return <span key={index} className={styles.letter}>{isGuessed ? letter.toUpperCase() : "_"}</span>;
//     })}
//   </div>
// )
    // return (
    //     <div>
    //         {word.split("").map((letter,index) => {
    //             const isGuessed = guessedLetters.has(letter.toUpperCase())
    //             return (<p key={index}>{isGuessed?letter:"_"}</p>)
    //         } )}
    //     </div>

    // )
// return (
//   <div className="bg-gray-50 border border-[#787b80]/30 rounded-md p-4">
//   <div className="flex justify-center gap-2 p-2">
    
//     {word.split("").map((letter, index) => {
//       const isGuessed = guessedLetters.has(letter.toUpperCase());
//       return (
//         <span
//           key={index}
//           className={`
//             text-xl font-mono w-6 h-8 flex items-center justify-center
//             border-b-2 border-gray-400
//             ${isGuessed ? "text-[#2d76c0] font-bold" : "text-gray-400"}
//           `}
//         >
//           {isGuessed ? letter.toUpperCase() : ""}
//         </span>
//       );
//     })}
//      {/* <p className="text-gray-700">{meaning}</p> */}
//   </div>
//   <p className="text-gray-700">{meaning}</p>
//   </div>
// );
return (
  <div className="bg-gray-50 border border-[#787b80]/30 rounded-md p-6">
    <div className="flex justify-center gap-4 p-4">

      {word.split("").map((letter, index) => {
        const isGuessed = guessedLetters.has(letter.toUpperCase());

        return (
          <span
            key={index}
            className={`
              text-5xl font-mono
              w-12 h-16
              flex items-center justify-center
              border-b-4
              ${isGuessed
                ? "text-[#1e40af] border-[#1e40af] font-bold"
                : "text-gray-300 border-gray-300"}
            `}
          >
            {isGuessed ? letter.toUpperCase() : ""}
          </span>
        );
      })}
    </div>

    <p className="text-gray-700 text-center text-xl font-bold mt-4">
      {meaning}
    </p>
  </div>
);

}