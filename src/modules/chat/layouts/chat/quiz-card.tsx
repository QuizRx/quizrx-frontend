import { Button } from '@/core/components/ui/button';
import CircularProgress from '@/core/components/ui/circular-progress';

export function QuizCard() {
  const percentage = 100;
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-sm mx-auto space-y-[32px]">
      <div className="flex flex-col">
        <div className='w-fit'>
          <div className="bg-[#F6F6F6] p-2 rounded-full">
            <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.5498 12.0737C10.7973 12.0737 11.0122 11.9828 11.1944 11.8012C11.3767 11.6195 11.4675 11.4046 11.467 11.1566C11.4664 10.9085 11.3755 10.6939 11.1944 10.5128C11.0133 10.3317 10.7985 10.2406 10.5498 10.2394C10.3012 10.2383 10.0866 10.3294 9.90609 10.5128C9.72558 10.6962 9.63445 10.9108 9.6327 11.1566C9.63096 11.4023 9.72209 11.6172 9.90609 11.8012C10.0901 11.9852 10.3047 12.076 10.5498 12.0737ZM9.89474 9.27862H11.2049C11.2049 8.85645 11.2486 8.54725 11.3359 8.35101C11.4233 8.15477 11.6271 7.89623 11.9474 7.57538C12.3841 7.13865 12.6752 6.78578 12.8208 6.51675C12.9664 6.24773 13.0392 5.93095 13.0392 5.56643C13.0392 4.91134 12.8098 4.37649 12.3509 3.96189C11.892 3.54729 11.2917 3.3397 10.5498 3.33912C9.95297 3.33912 9.43268 3.50653 8.98897 3.84136C8.54525 4.17618 8.23575 4.62019 8.06048 5.17338L9.23965 5.65378C9.37067 5.28984 9.54914 5.01703 9.77508 4.83535C10.001 4.65367 10.2593 4.56254 10.5498 4.56196C10.8992 4.56196 11.1831 4.66037 11.4015 4.85718C11.6198 5.054 11.729 5.31953 11.729 5.65378C11.729 5.85758 11.6708 6.05062 11.5543 6.23288C11.4378 6.41514 11.234 6.64428 10.9429 6.92029C10.4625 7.34246 10.1678 7.67379 10.0589 7.91428C9.95006 8.15477 9.89532 8.60955 9.89474 9.27862ZM5.3091 14.694C4.82869 14.694 4.41759 14.5231 4.07578 14.1813C3.73396 13.8395 3.56277 13.4281 3.56218 12.9471V2.46566C3.56218 1.98526 3.73338 1.57415 4.07578 1.23234C4.41817 0.89053 4.82928 0.719332 5.3091 0.71875H15.7906C16.271 0.71875 16.6824 0.889947 17.0248 1.23234C17.3672 1.57474 17.5381 1.98584 17.5375 2.46566V12.9471C17.5375 13.4275 17.3666 13.8389 17.0248 14.1813C16.6829 14.5237 16.2716 14.6946 15.7906 14.694H5.3091ZM1.81527 18.1879C1.33487 18.1879 0.923764 18.017 0.581952 17.6752C0.240139 17.3333 0.0689417 16.9219 0.0683594 16.441V4.21257H1.81527V16.441H14.0437V18.1879H1.81527Z" fill="#1375FE"/>
            </svg>
          </div>
        </div>
        <h3 className="font-medium text-[16px] mt-[22px]">
          Disorders of the Thyroid Glandwdd
        </h3>
        <p className="text-[#717278] text-[14px] font-medium mt-[20px]">
          Explore how the thyroid gland regulates metabolism and energy levels.
        </p>
      </div>

      <div>
        <p className="font-medium text-[12px] mb-[20px]">Includes:</p>
        <ul className="text-[12px] text-[#717278] space-y-[13px] font-medium">
          <li className="flex items-center gap-2">
            {/* <CheckSquare className="text-blue-500 w-4 h-4" /> */}
            Difficulty Level - Medium
          </li>
          <li className="flex items-center gap-2">
            {/* <CheckSquare className="text-blue-500 w-4 h-4" /> */}
            Question Type - Multi Choice
          </li>
          <li className="flex items-center gap-2">
            {/* <CheckSquare className="text-blue-500 w-4 h-4" /> */}
            Question Topic - Endocrinology
          </li>
        </ul>
      </div>

      <hr />

      <div>
        <div className="flex items-center justify-center gap-[12px]">
          <CircularProgress percentage={percentage} textColor="#717278" strokeColor={percentage === 100 ? "#18AF76" : "#1375FE"} />
          <span className="text-gray-500 font-medium">Completed</span>
        </div>

        <div className="flex justify-between mt-[38px]">
          <Button
            variant="outline"
            className="text-[#FF5900]"
          >Continue</Button>
          <Button
            variant="outline"
            className="text-[#1375FE]"
          >Retake</Button>
        </div>
      </div>
    </div>
  );
}
