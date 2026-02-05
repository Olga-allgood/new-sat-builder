interface WordMeaningProps {meaning: string};

export default function WordMeaning({meaning}:WordMeaningProps) {
    // return (<div>
    //         <h1>Meaning of the word</h1>
    //         <p>{meaning}</p>

    //        </div>)
return (
  <div className="bg-gray-50 border border-[#787b80]/30 rounded-md p-4">
    {/* <h3 className="text-lg font-semibold text-[#2d76c0] mb-2">
      Meaning of the word
    </h3> */}
    {/* <p className="text-gray-700">{meaning}</p> */}
  </div>
);
}

