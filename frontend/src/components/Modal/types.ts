import { ObjectType } from '../../types/index';

export type ModalPageProps = {
  onSubmit: (data: ObjectType) => void;
  formData?: ObjectType;
};
