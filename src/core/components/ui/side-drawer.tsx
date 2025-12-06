import * as Dialog from "@radix-ui/react-dialog";
import { Cross1Icon } from "@radix-ui/react-icons";
import DrawerContentQuestion from "../ui/drawer-content-question";
import DrawerContentQuiz from "../ui/drawer-content-quiz";
import DrawerContentQuestionBank from "../ui/drawer-content-question-bank";
import DrawerContentMockExam from "./drawer-content-mock-exam";

interface SideDrawerProps {
  isOpen: boolean;
  data: any;
  onOpenChange: any;
  drawerType?: "question" | "quiz" | "question-bank" | "mock-exam" | null;
  refetchFunction?: () => void;
}

export function SideDrawer({
  isOpen,
  data,
  onOpenChange,
  drawerType,
  refetchFunction,
}: SideDrawerProps) {


  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/10 z-40" />

        <Dialog.Content
          className="
            fixed top-0 right-0 h-full w-100 bg-white z-50 py-6 shadow-lg
            transition-transform duration-300 ease-out overflow-y-scroll
            data-[state=open]:translate-x-0
            data-[state=closed]:translate-x-full
          "
        >
          <div className="flex justify-between items-center mb-4 px-6">
            <Dialog.Title className="text-lg font-bold">
              {drawerType === "question" && "Question Details"}
              {drawerType === "quiz" && "Quiz Details"}
              {drawerType === "question-bank" && "Question Bank Details"}
              {drawerType === "mock-exam" && "Mock Exam Details"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="text-gray-500 hover:text-gray-800"
              >
                <Cross1Icon />
              </button>
            </Dialog.Close>
          </div>

          {drawerType === "question" && (
            <DrawerContentQuestion data={data} onOpenChange={onOpenChange} />
          )}
          {drawerType === "quiz" && (
            <DrawerContentQuiz
              questionIds={data?.questionIds}
              onOpenChange={onOpenChange}
            />
          )}
          {drawerType === "question-bank" && (
            <DrawerContentQuestionBank data={data} onOpenChange={onOpenChange} />
          )}

          {drawerType === "mock-exam" && (
            <DrawerContentMockExam
              data={data}
              questionIds={data?.questionIds}
              onOpenChange={onOpenChange}
              refetchFunction={refetchFunction}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
