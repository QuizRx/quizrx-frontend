import { useState } from 'react';
import SavedQuizCard from './saved-quiz-card';

interface QuizCollectionProps {
  collection: {
    title: string;
  },
  quizzes: {
    collectionId: string;
  }[]
}
function QuizCollection({
  quizzes,
  collection
}: QuizCollectionProps) {
  return <div>
    <div className="bg-white font-semibold text-[20px] text-[#717278] px-[32px] py-[16px]">
      {collection.title}
    </div>

    <div className='grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-[25px]'>
      {
        quizzes.map((quiz, quizIndex) => {
          return (<div
            key={`quiz-${quizIndex}`}
          >
            <SavedQuizCard />
          </div>)
        })
      }
    </div>
  </div>
}

export default function QuizCollectionTab() {
  const [addCollectionDialog, setAddCollectionDialog] = useState(false);
  const collections = [
    {
      id: "1",
      title: "Endo Questions",
    },
    {
      id: "2",
      title: "Thyroid Gland Questions",
    },
    {
      id: "3",
      title: "Brain Ache Questions",
    },
    {
      id: "4",
      title: "Untitled",
    }
  ];

  const quizzes = [
    {
      collectionId: 2
    },
    {
      collectionId: 1
    },
    {
      collectionId: 2
    },
    {
      collectionId: 2
    },
    {
      collectionId: 3
    }
  ];

  const quizCollectionMap = quizzes.reduce((a, b) => {
    if (!a[b.collectionId]) a[b.collectionId] = [];
    a[b.collectionId].push(b);
    return a;
  }, ({} as Record<string, any[]>))
  return <>
    {/* <AddToCollectionModal isOpen={addCollectionDialog} onClose={() => setAddCollectionDialog(false)} onAdd={() => console.log('add')} /> */}
    {/* <AddCollectionDialog isDialogOpen={addCollectionDialog} setIsDialogOpen={setAddCollectionDialog} onSubmit={() => console.log('add')} /> */}
    <div
      className='flex justify-between items-center bg-white w-fit p-[16px] rounded-[8px] border-2 border-[#317DE6] cursor-pointer'
      onClick={() => setAddCollectionDialog(true)}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z" fill="black"/>
      </svg>

      <span className="ml-[16px] font-medium text-[16px]">New Collection</span>
    </div>
    
    <div className="flex flex-col gap-[20px] mt-[40px]">
      {
        collections.map((collection, indexCollection) => {
          return <QuizCollection
            key={`collection-${indexCollection}`}
            quizzes={quizCollectionMap[collection.id] || []}
            collection={collection}
          />
        })
      }
    </div>
  </>;
}
