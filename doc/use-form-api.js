const { default: ReactForm, useField, useSubmit, useReset, useFormApi } = _ReactForm;
const { useRef } = React;
const { Button, Space, Divider, message } = antd;

const Input = props => {
  const fieldProps = useField(props);

  return (
    <div style={{ marginBottom: 16 }}>
      <label>{fieldProps.label}</label>
      <div>
        <input
          ref={fieldProps.fieldRef}
          type="text"
          value={fieldProps.value || ''}
          onChange={fieldProps.onChange}
          onBlur={fieldProps.triggerValidate}
          style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4, width: 200 }}
        />
        {fieldProps.errMsg && <span style={{ color: 'red', marginLeft: 8 }}>{fieldProps.errMsg}</span>}
      </div>
    </div>
  );
};

const SubmitButton = ({ children }) => {
  const { isLoading, isPass, onClick } = useSubmit();
  return (
    <button onClick={onClick} disabled={isLoading || !isPass} style={{ padding: '8px 16px', marginRight: 8 }}>
      {isLoading ? '提交中...' : children}
    </button>
  );
};

const ResetButton = () => {
  const { onClick } = useReset();
  return <button onClick={onClick} style={{ padding: '8px 16px' }}>重置</button>;
};

const Options = () => {
  const { openApi: formApi } = useFormApi();

  return (
    <div style={{ marginBottom: 20, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
      <h4>操作面板 (useFormApi)</h4>
      <Space wrap>
        <Button type="primary" onClick={() => {
          const data = formApi.getFormData();
          console.log('表单数据:', data);
          message.success('请查看控制台');
        }}>
          获取表单值
        </Button>
        <Button onClick={() => {
          formApi.setField({ name: 'name', value: '修改后的姓名' });
        }}>
          设置 name 字段
        </Button>
        <Button onClick={() => {
          formApi.setFields([
            { name: 'name', value: '李四' },
            { name: 'email', value: 'lisi@example.com' },
            { name: 'phone', value: '13900139000' }
          ]);
        }}>
          批量设置字段
        </Button>
        <Button danger onClick={() => {
          formApi.setFieldValidate({
            name: 'phone',
            validate: { status: 2, msg: '手机号格式错误' }
          });
        }}>
          设置验证错误
        </Button>
        <Button onClick={() => {
          formApi.reset();
        }}>
          重置表单
        </Button>
      </Space>
    </div>
  );
};

const BaseExample = () => {
  const formApiRef = useRef();
  return (
    <div>
      <h3>useFormApi Hook 示例</h3>
      <ReactForm ref={formApiRef}>
        <Options />
        <Input name="name" label="姓名" rule="REQ LEN-0-10" />
        <Input name="email" label="邮箱" rule="REQ EMAIL" />
        <Input name="phone" label="手机号" rule="REQ TEL" />
        <div>
          <SubmitButton>提交</SubmitButton>
          <ResetButton />
        </div>
      </ReactForm>
    </div>
  );
};

render(<BaseExample />);
