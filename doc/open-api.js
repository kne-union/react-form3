const { default: ReactForm, useField, useSubmit, useReset } = _ReactForm;
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

const BaseExample = () => {
  const formApiRef = useRef();
  return (
    <div>
      <h3>ref 操作 API 示例</h3>
      <Space direction="vertical" style={{ marginBottom: 20 }}>
        <Space wrap>
          <Button type="primary" onClick={() => {
            const data = formApiRef.current.data;
            console.log('表单数据:', data);
            message.success('请查看控制台');
          }}>
            获取表单值
          </Button>
          <Button onClick={() => {
            formApiRef.current.setField({ name: 'name', value: '设置的新名称' });
          }}>
            设置 name 字段值
          </Button>
          <Button onClick={() => {
            formApiRef.current.setFields([
              { name: 'name', value: '张三' },
              { name: 'email', value: 'zhangsan@example.com' },
              { name: 'phone', value: '13800138000' }
            ]);
          }}>
            批量设置字段值
          </Button>
          <Button danger onClick={() => {
            formApiRef.current.setFieldValidate({
              name: 'email',
              validate: { status: 2, msg: '邮箱格式不正确' }
            });
          }}>
            设置校验错误
          </Button>
          <Button onClick={() => {
            formApiRef.current.reset();
          }}>
            重置表单
          </Button>
        </Space>
        <Divider />
      </Space>

      <ReactForm ref={formApiRef}>
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
