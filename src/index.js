import { filterEmpty, isEmpty, isNotEmpty } from './core/empty';
import compileErrMsg from './core/compileErrMsg';
import Field from './core/Field';
import { useFormApi } from './Form/FormApiProvider';

const stateToIsPass = Field.stateToIsPass,
  stateToError = Field.stateToError,
  computedFormDataFormState = Field.computedFormDataFormState,
  findField = Field.findField,
  matchFields = Field.matchFields,
  computedFieldValueFromFormData = Field.computedFieldValueFromFormData;

export { default } from './Form';
export {
  isNotEmpty,
  isEmpty,
  filterEmpty,
  compileErrMsg,
  stateToIsPass,
  stateToError,
  computedFormDataFormState,
  findField,
  matchFields,
  computedFieldValueFromFormData,
  useFormApi, // 此处为兼容老版本操作，请尽量使用useFormApi
  useFormApi as useFormContext
};
export { default as useField } from './Field/useField';
export { GroupList } from './Group';
export { presetRules as preset, default as RULES } from './core/RULES';
export { default as interceptors } from './core/interceptors';
export { default as useReset } from './useReset';
export { default as useSubmit } from './useSubmit';

export const formUtils = {
  isNotEmpty,
  isEmpty,
  filterEmpty,
  compileErrMsg,
  stateToIsPass,
  stateToError,
  computedFormDataFormState,
  findField,
  matchFields,
  computedFieldValueFromFormData
};
