import createSetDataEvent from '../Form/event/createSetDataEvent';
import Field, { FORM_FIELD_STATE_ENUM } from '../core/Field';

const defaultInterceptor = {
  input: ({ value }) => value,
  output: ({ value }) => value
};

describe('createSetDataEvent initFormData', () => {
  test('setFormData 时同步更新 initFormData（供后挂载 GroupList/字段读取）', async () => {
    const formState = new Map();
    let initFormData = { skill: [{ name: 'old' }] };
    const formContextRef = {
      current: {
        initFormData,
        getInitFormData: () => initFormData,
        setInitFormData: next => {
          initFormData = next;
        },
        formState,
        getFormState: () => formState,
        setFormState: updater => {
          const newState = typeof updater === 'function' ? updater(formState) : updater;
          formState.clear();
          newState.forEach((v, k) => formState.set(k, v));
        },
        emitter: {
          emit: jest.fn()
        }
      }
    };

    const field = new Field({ id: 'f1', name: 'name', formInterceptor: defaultInterceptor });
    field.setInfo({
      groupName: 'skill',
      groupIndex: 0,
      label: '名称',
      rule: '',
      interceptor: null,
      noTrim: false,
      fieldRef: null,
      errMsg: ''
    });
    expect(field.state).toBe(FORM_FIELD_STATE_ENUM.INIT);
    formState.set('f1', field);

    const setData = createSetDataEvent(formContextRef);
    const next = {
      skill: [
        {
          name: '技能 A',
          contentItems: [
            { title: 'A1', description: 'd1', source: 'JD' },
            { title: 'A2', description: 'd2', source: '报告' }
          ]
        },
        {
          name: '技能 B',
          contentItems: [
            { title: 'B1', description: 'd1', source: 'JD' },
            { title: 'B2', description: 'd2', source: '报告' }
          ]
        }
      ]
    };

    await setData({ data: next, runValidate: false });

    expect(formContextRef.current.getInitFormData()).toEqual(next);
    expect(formContextRef.current.getInitFormData()).not.toBe(next);
    expect(formContextRef.current.getInitFormData().skill[1].contentItems).toHaveLength(2);
    expect(formState.get('f1').value).toBe('技能 A');
  });
});
