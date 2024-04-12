const { default: ReactForm, useField, useSubmit, useReset, useFormApi } = _ReactForm;
const { useRef } = React;
const { Button, Space } = antd;

const Input = props => {
  const fieldProps = useField(props);

  return (<div>
    {fieldProps.label}
    <input ref={fieldProps.fieldRef} type="text" value={fieldProps.value || ''} onChange={fieldProps.onChange}
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

const Options = () => {
  const { openApi: formApi } = useFormApi();

  console.log(formApi);

  return <Space>
    <Button onClick={() => {
      console.log(formApi.getFormData());
    }}>获取表单值</Button>
    <Button onClick={() => {
      formApi.setField({ name: 'name', value: '哈哈哈' });
    }}>设置字段值</Button>
    <Button onClick={() => {
      formApi.setFields([{ name: 'name', value: '哈哈哈' }, {
        name: 'name2', value: '哈哈哈2'
      }, { name: 'name3', value: '哈哈哈3' }]);
    }}>设置多个字段值</Button>
    <Button onClick={() => {
      formApi.setFieldValidate({
        name: 'name2', validate: { status: 2, msg: '我是一个通过api设置的错误' }
      });
    }}>设置校验信息</Button>
  </Space>;
};

const BaseExample = () => {
  const formApiRef = useRef();
  return <div>
    <ReactForm ref={formApiRef}>
      <div><Options /></div>
      <Input name="name" label="名称" rule="REQ LEN-0-10" />
      <Input name="name2" label="名称2" rule="REQ LEN-0-10" />
      <Input name="name3" label="名称3" rule="REQ LEN-0-10" />
      <div>
        <SubmitButton>提交</SubmitButton>
        <ResetButton>重置</ResetButton>
      </div>
    </ReactForm>
  </div>;
};

render(<BaseExample />);
