import { useRiders } from '../../context/RidersContext';
import { useToast, ToastStatus } from '../../context/toastContext';

const CopyButton = () => {
  const { showToast } = useToast();
  const { riders } = useRiders();
  const emails = riders
    .filter((r) => r.active)
    .map((r) => r.email)
    .join(',');

  const handleClick = () => {
    navigator.clipboard
      .writeText(emails)
      .then(() =>
        showToast('Student e-mails copied to clipboard.', ToastStatus.SUCCESS)
      );
  };

  return (
    <button
      onClick={handleClick}
      className="w-40 h-10 flex items-center justify-center cursor-pointer rounded-sm text-base whitespace-nowrap pl-6 pr-6 border border-[#ddd] bg-white transition-colors duration-100 hover:bg-[#fafafa] active:bg-[#eaeaea]"
    >
      Copy Emails
    </button>
  );
};

export default CopyButton;
