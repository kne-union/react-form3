const { default: ReactForm, useField, useSubmit, useReset, GroupList } = _ReactForm;

const { useRef } = React;

const Input = props => {
  const fieldProps = useField(props);

  return (<div>
    {fieldProps.label}
    <input {...fieldProps.associationOptions} ref={fieldProps.fieldRef} type="text" value={fieldProps.value || ''}
           onChange={fieldProps.onChange}
           onBlur={fieldProps.triggerValidate} />
    {fieldProps.errState}
    {fieldProps.errMsg}
  </div>);
};

const SubmitButton = ({ children }) => {
  const { isLoading, onClick } = useSubmit();
  return (<button onClick={onClick}>
    {children}
    {isLoading ? '正在提交中...' : ''}
  </button>);
};

const ResetButton = () => {
  const { onClick } = useReset();
  return <button onClick={onClick}>重置</button>;
};

const BaseExample = () => {
  const ref = useRef(null);
  return <div>
    <ReactForm onSubmit={(data) => {
      console.log('submit:', data);
    }}>
      <Input name="name" label="名称" rule="REQ LEN-0-10" />
      <Input name="des" label="描述" rule="LEN-0-10" associations={{
        fields: [{
          name: 'name'
        }], callback: ({ target, origin, openApi }) => {
          openApi.setFieldValue(target, origin.value);
        }
      }} />
      <hr />
      <Input name="familyName" label="姓" rule="REQ LEN-0-10" />
      <Input name="firstName" label="名" rule="REQ LEN-0-10" />
      <Input name="fullName" label="全名" rule="REQ LEN-0-20" associations={{
        fields: [{
          name: 'familyName'
        }, {
          name: 'firstName'
        }], callback: ({ target, openApi }) => {
          const { firstName, familyName } = openApi.getFormData();
          openApi.setFieldValue(target, firstName && firstName ? `${firstName} ${familyName}` : '');
        }
      }} />
      <hr />
      <Input name="money" label="金额" />
      <Input name="ratio" label="比例" />
      <Input name="all" label="总金额" associations={{
        fields: [{
          name: 'money'
        }, {
          name: 'ratio'
        }], callback: ({ target, openApi }) => {
          const { money, ratio } = openApi.getFormData();
          openApi.setFieldValue(target, money && ratio && ratio > 0 ? money / ratio : '');
        }
      }} />
      <hr />
      <div>
        <button onClick={() => {
          ref.current.onAdd();
        }}>添加
        </button>
      </div>
      <GroupList ref={ref} name="group" defaultLength={1}>{({ index, onRemove }) => {
        return <div>
          <div>第{index + 1}项</div>
          <Input name="sum" label="数量" />
          <button onClick={() => {
            onRemove();
          }}>删除
          </button>
        </div>;
      }}</GroupList>
      <Input name="amount" label="总数" associations={{
        fields: [{
          name: 'sum', groupName: 'group'
        }], callback: ({ target, openApi }) => {
          const { group } = openApi.getFormData();
          openApi.setFieldValue(target, group.filter((item) => item.sum > 0).reduce((a, b) => a + parseInt(b.sum), 0));
        }
      }} />
      <div>
        <SubmitButton>提交</SubmitButton>
        <ResetButton>重置</ResetButton>
      </div>
    </ReactForm>
  </div>;
};

render(<BaseExample />);
