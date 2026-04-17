const { default: ReactForm, useField, useSubmit, useReset, useFormApi } = _ReactForm;
const { useRef } = React;
const { Button, Space, Card, Input: AntInput, InputNumber, Select, Switch, Typography, message, Divider, Descriptions, Alert } = antd;
const { Text } = Typography;

// ========================================
// 通用组件
// ========================================

const Input = props => {
  const fieldProps = useField(props);
  const isError = fieldProps.errState === 2;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 4 }}>
        <Text type={isError ? 'danger' : undefined}>{fieldProps.label}</Text>
      </div>
      <div>
        <AntInput
          ref={fieldProps.fieldRef}
          type={props.type || 'text'}
          value={fieldProps.value ?? ''}
          onChange={e => {
            fieldProps.onChange(e.target.value);
            fieldProps.triggerValidate();
          }}
          onBlur={fieldProps.triggerValidate}
          placeholder={props.placeholder}
          status={isError ? 'error' : undefined}
          style={{ width: props.width || 200 }}
        />
        {fieldProps.errMsg && (
          <Text type="danger" style={{ marginLeft: 8, fontSize: 12 }}>
            {fieldProps.errMsg}
          </Text>
        )}
      </div>
    </div>
  );
};

const NumberInput = props => {
  const fieldProps = useField(props);
  const isError = fieldProps.errState === 2;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 4 }}>
        <Text type={isError ? 'danger' : undefined}>{fieldProps.label}</Text>
      </div>
      <div>
        <InputNumber
          ref={fieldProps.fieldRef}
          value={fieldProps.value}
          onChange={val => {
            fieldProps.onChange(val);
            fieldProps.triggerValidate();
          }}
          placeholder={props.placeholder}
          status={isError ? 'error' : undefined}
          style={{ width: props.width || 200 }}
          min={props.min}
          max={props.max}
        />
        {fieldProps.errMsg && (
          <Text type="danger" style={{ marginLeft: 8, fontSize: 12 }}>
            {fieldProps.errMsg}
          </Text>
        )}
      </div>
    </div>
  );
};

const SelectField = props => {
  const fieldProps = useField(props);
  const isError = fieldProps.errState === 2;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 4 }}>
        <Text type={isError ? 'danger' : undefined}>{fieldProps.label}</Text>
      </div>
      <div>
        <Select
          ref={fieldProps.fieldRef}
          value={fieldProps.value}
          onChange={val => {
            fieldProps.onChange(val);
            fieldProps.triggerValidate();
          }}
          placeholder={props.placeholder}
          status={isError ? 'error' : undefined}
          style={{ width: props.width || 200 }}
          options={props.options}
        />
        {fieldProps.errMsg && (
          <Text type="danger" style={{ marginLeft: 8, fontSize: 12 }}>
            {fieldProps.errMsg}
          </Text>
        )}
      </div>
    </div>
  );
};

const SwitchField = props => {
  const fieldProps = useField(props);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 4 }}>
        <Text>{fieldProps.label}</Text>
      </div>
      <div>
        <Switch
          ref={fieldProps.fieldRef}
          checked={!!fieldProps.value}
          onChange={val => {
            fieldProps.onChange(val);
          }}
        />
        <Text type="secondary" style={{ marginLeft: 8 }}>
          当前值: {String(fieldProps.value)}
        </Text>
      </div>
    </div>
  );
};

const SubmitButton = ({ children }) => {
  const { isLoading, onClick } = useSubmit();
  return (
    <Button type="primary" onClick={onClick} loading={isLoading}>
      {children}
    </Button>
  );
};

const ResetButton = () => {
  const { onClick } = useReset();
  return <Button onClick={onClick} style={{ marginLeft: 8 }}>重置</Button>;
};

// ========================================
// FormInner 组件：展示表单当前数据
// ========================================

const FormInner = () => {
  const { openApi: formApi } = useFormApi();
  const formData = formApi.getFormData();

  return (
    <Card type="inner" title="当前表单数据" style={{ marginBottom: 16 }}>
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="表单数据">
          <Text code>{JSON.stringify(formData)}</Text>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

// ========================================
// 示例：data 中包含数字 0 的表单
// ========================================

const ZeroValueExample = () => {
  return (
    <Card title="data 中值为 falsy (0/false) 的示例" extra={
      <Text type="secondary" style={{ fontSize: 12 }}>
        验证 data 中字段值为 0 时能正确显示
      </Text>
    }>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message="说明"
          description='当 Form 的 data 属性中字段值为 0 或 false 等 falsy 值时，表单需要正确识别并赋值，而非将其视为空值。'
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <ReactForm
          debug
          data={{
            name: '测试项目',
            count: 0,
            score: 0,
            level: 0,
            enabled: 0,
            isActive: false,
            isPublic: false,
            description: ''
          }}
          onSubmit={async data => {
            await new Promise(resolve => {
              setTimeout(() => resolve(), 1000);
            });
            console.log('submit:', data);
            message.success('提交成功: ' + JSON.stringify(data, null, 2));
          }}
        >
          <FormInner />

          <Divider>值为 0 的字段</Divider>

          <Input name="name" label="名称" rule="REQ" placeholder="请输入名称" />

          <NumberInput name="count" label="数量 (data=0)" rule="REQ" placeholder="请输入数量" />

          <NumberInput name="score" label="分数 (data=0)" rule="REQ" placeholder="请输入分数" min={0} max={100} />

          <SelectField
            name="level"
            label="等级 (data=0)"
            rule="REQ"
            placeholder="请选择等级"
            options={[
              { value: 0, label: '0 - 最低' },
              { value: 1, label: '1 - 普通' },
              { value: 2, label: '2 - 良好' },
              { value: 3, label: '3 - 优秀' }
            ]}
          />

          <SelectField
            name="enabled"
            label="状态 (data=0)"
            rule="REQ"
            placeholder="请选择状态"
            options={[
              { value: 0, label: '0 - 禁用' },
              { value: 1, label: '1 - 启用' }
            ]}
          />

          <Divider>值为 false 的字段</Divider>

          <SwitchField name="isActive" label="是否激活 (data=false)" />

          <SwitchField name="isPublic" label="是否公开 (data=false)" />

          <Input name="description" label="描述 (data='')" placeholder="请输入描述" />

          <Divider />

          <Space>
            <SubmitButton>提交</SubmitButton>
            <ResetButton />
          </Space>
        </ReactForm>
      </Space>
    </Card>
  );
};

render(<ZeroValueExample />);
