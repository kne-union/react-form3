const { default: ReactForm, useField, useSubmit, useReset } = _ReactForm;
const { useRef } = React;
const { Button, Space, Card, Input: AntInput, Divider, Typography, message } = antd;
const { Text } = Typography;

const Input = props => {
  const fieldProps = useField(props);
  const isError = fieldProps.errState === 2;
  const isValidating = fieldProps.errState === 3;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 4 }}>
        <Text type={isError ? 'danger' : undefined}>{fieldProps.label}</Text>
      </div>
      <div>
        <AntInput
          ref={fieldProps.fieldRef}
          type="text"
          value={fieldProps.value || ''}
          onChange={e => fieldProps.onChange(e.target.value)}
          onBlur={fieldProps.triggerValidate}
          status={isError ? 'error' : undefined}
          style={{ width: 200 }}
        />
        {fieldProps.errMsg && (
          <Text type="danger" style={{ marginLeft: 8, fontSize: 12 }}>
            {fieldProps.errMsg}
          </Text>
        )}
        {isValidating && (
          <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
            验证中...
          </Text>
        )}
      </div>
    </div>
  );
};

const SubmitButton = ({ children }) => {
  const { isLoading, onClick } = useSubmit();
  return (
    <Button type="primary" onClick={onClick} loading={isLoading} style={{ marginRight: 8 }}>
      {children}
    </Button>
  );
};

const ResetButton = () => {
  const { onClick } = useReset();
  return <Button onClick={onClick}>重置</Button>;
};

const BaseExample = () => {
  const formApiRef = useRef();
  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Card title="ref 操作 API 示例" bordered={false}>
        <Card type="inner" title="操作面板" style={{ marginBottom: 16 }}>
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
        </Card>

        <ReactForm ref={formApiRef}>
          <Input name="name" label="姓名" rule="REQ LEN-0-10" />
          <Input name="email" label="邮箱" rule="REQ EMAIL" />
          <Input name="phone" label="手机号" rule="REQ TEL" />
          <div>
            <Space>
              <SubmitButton>提交</SubmitButton>
              <ResetButton />
            </Space>
          </div>
        </ReactForm>
      </Card>
    </div>
  );
};

render(<BaseExample />);
