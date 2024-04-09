import last from 'lodash/last';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import clone from 'lodash/clone';
import transform from 'lodash/transform';
import set from 'lodash/set';
import ruleValidate from './ruleValidate';
import compileErrMsg from './compileErrMsg';

export const FORM_FIELD_STATE_ENUM = {
  PRE_INIT: 'PRE_INIT',
  INIT: 'INIT'
};

export const FORM_FIELD_VALIDATE_STATE_ENUM = {
  INIT: 'INIT',
  PENDING: 'PENDING',
  PASS: 'PASS',
  ERROR: 'ERROR'
};

class Field {
  constructor({ id, name, associations, formInterceptor, options }) {
    this.id = id;
    this.name = name;
    this.formInterceptor = formInterceptor;
    this.groupName = null;
    this.groupIndex = null;
    this.state = FORM_FIELD_STATE_ENUM.PRE_INIT;
    this.fieldRef = null;
    this.associations = {
      fields: get(associations, 'fields', []).filter(item => !!item.name),
      callback: get(associations, 'callback', () => {})
    };
    this.validate = { status: FORM_FIELD_VALIDATE_STATE_ENUM.INIT };
    this.value = void 0;
    this.options = Object.assign({}, options);
  }

  get isPass() {
    return this.validate.status === FORM_FIELD_VALIDATE_STATE_ENUM.PASS;
  }

  static findField = (formState, token) => {
    if (token.id) {
      return formState[token.id];
    }
    if (!token.groupName) {
      return Object.values(formState).find(field => field.name === token.name);
    }
    return Object.values(formState).find(field => field.name === token.name && field.groupName === token.groupName && field.groupIndex === token.groupIndex);
  };

  static matchFields = (formState, token) => {
    if (!token.groupName) {
      const target = Field.findField(formState, token);
      return target ? [target] : [];
    }
    return Object.values(formState).filter(field => {
      return Object.keys(token)
        .filter(key => !isNil(token[key]))
        .every(key => field[key] === token[key]);
    });
  };

  static matchAssociationFields = (formState, target) => {
    return Object.values(formState).filter(field => {
      if (field.id === target.id) {
        // 排除自己
        return false;
      }
      if (!field.associations.fields && field.associations.fields.length > 0) {
        return false;
      }

      return field.associations.fields.some(token => {
        return Object.keys(token)
          .filter(key => !isNil(token[key]))
          .every(key => target[key] === token[key]);
      });
    });
  };

  static getFieldValuePath = options => {
    if (options.groupName && !isNil(options.groupIndex) && last(options.groupName.split('.')) === options.name) {
      return `${options.groupName}["${options.groupIndex}"]`;
    }
    if (options.groupName && !isNil(options.groupIndex)) {
      return `${options.groupName}["${options.groupIndex}"].${options.name}`;
    }

    return options.name;
  };

  static computedFieldValueFromFormData = (field, formData) => {
    return get(formData, Field.getFieldValuePath(field));
  };

  static computedFormDataFormState = state => {
    return transform(
      state,
      (result, field, id) => {
        if (!field.name) {
          return;
        }
        const fieldValue = field.getFieldValue();
        set(result, Field.getFieldValuePath(field), fieldValue);
      },
      {}
    );
  };

  static stateToError = formState => {
    return Object.values(formState)
      .filter(field => {
        return get(field, 'validate.status') === FORM_FIELD_VALIDATE_STATE_ENUM.ERROR;
      })
      .map(field => {
        return Object.assign({}, field.validate, {
          name: field.name,
          label: field.label,
          groupName: field.groupName,
          fieldRef: field.fieldRef,
          groupIndex: field.groupIndex,
          errMsg: field.getErrMsg()
        });
      });
  };

  static stateToIsPass = formState => {
    return Object.values(formState).every(field => {
      return field.isPass;
    });
  };

  setInfo({ groupName, groupIndex, label, rule, interceptor, noTrim, fieldRef, errMsg }) {
    this.groupName = groupName;
    this.groupIndex = groupIndex;
    this.label = label;
    this.rule = rule;
    this.interceptor = interceptor;
    this.noTrim = noTrim;
    this.fieldRef = fieldRef;
    this.errMsg = errMsg;
    this.state = FORM_FIELD_STATE_ENUM.INIT;
    return this;
  }

  getValueFromFormData(formData) {
    return Field.computedFieldValueFromFormData(this, formData);
  }

  setFieldValue(value) {
    this.setValue(this.formInterceptor.input({ value, interceptor: this.interceptor }));
    return this;
  }

  getFieldValue() {
    return this.formInterceptor.output({ value: this.value, interceptor: this.interceptor });
  }

  getErrState() {
    if (this.validate.status === FORM_FIELD_VALIDATE_STATE_ENUM.PASS) {
      return 1;
    }
    if (this.validate.status === FORM_FIELD_VALIDATE_STATE_ENUM.ERROR) {
      return 2;
    }
    if (this.validate.status === FORM_FIELD_VALIDATE_STATE_ENUM.PENDING) {
      return 3;
    }

    return 0;
  }

  getErrMsg() {
    return compileErrMsg(this.errMsg || this.validate.msg || '', this.label);
  }

  setValidateStatus({ status, msg = '', validateData }) {
    this.validate = {
      status: (status => {
        if (status === 1) {
          return FORM_FIELD_VALIDATE_STATE_ENUM.PASS;
        }
        if (status === 2) {
          return FORM_FIELD_VALIDATE_STATE_ENUM.ERROR;
        }
        return FORM_FIELD_VALIDATE_STATE_ENUM.INIT;
      })(status),
      msg,
      validateData: Object.assign({}, this.validate.validateData, validateData)
    };
    return this;
  }

  async runValidate(rules, getFormData) {
    const validate = await ruleValidate({
      field: this.clone(),
      value: this.value,
      formRules: rules,
      getFormData
    });

    this.validate = {
      status: validate.result === true ? FORM_FIELD_VALIDATE_STATE_ENUM.PASS : FORM_FIELD_VALIDATE_STATE_ENUM.ERROR,
      msg: validate.errMsg,
      validateData: Object.assign({}, validate.data)
    };
    return this;
  }

  setValue(value) {
    this.value = value;
    this.validate = { status: FORM_FIELD_VALIDATE_STATE_ENUM.INIT };
    setTimeout(() => {
      this.options.onValueChange?.(this);
    }, 0);
    return this;
  }

  deleteValue() {
    this.setValue(void 0);
    return this;
  }

  clone() {
    return clone(this);
  }
}

export default Field;
