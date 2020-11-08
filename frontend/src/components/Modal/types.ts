import { ObjectType } from '../../types/index';

export type ModalPageProps = {
  onBack?: () => void;
  onSubmit: (data: ObjectType) => void;
  formData?: ObjectType;
};
