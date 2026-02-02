const { default: ReactForm, useField, useSubmit, useReset, useFormApi } = _ReactForm;
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

const Options = () => {
  const { openApi: formApi } = useFormApi();

  return (
    <Card type="inner" title="操作面板 (useFormApi)" style={{ marginBottom: 16 }}>
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
    </Card>
  );
};

const BaseExample = () => {
  const formApiRef = useRef();
  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Card title="useFormApi Hook 示例" bordered={false}>
        <ReactForm ref={formApiRef}>
          <Options />
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
