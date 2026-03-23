const { default: ReactForm, useField, useSubmit, useReset, useFormApi } = _ReactForm;
const { useRef } = React;
const { Button, Space, Card, Input: AntInput, Typography, message, Divider, Descriptions, Select, Row, Col } = antd;
const { Text } = Typography;

// ========================================
// 通用输入组件
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
          type="text"
          value={fieldProps.value || ''}
          onChange={e => fieldProps.onChange(e.target.value)}
          onBlur={fieldProps.triggerValidate}
          placeholder={props.placeholder}
          status={isError ? 'error' : undefined}
          style={{ width: 200 }}
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

// ========================================
// Object 类型字段组件 (defaultValue 为对象)
// ========================================

const AddressField = props => {
  const fieldProps = useField(props);
  const isError = fieldProps.errState === 2;
  const value = fieldProps.value || {};

  const handleChange = (key, newValue) => {
    fieldProps.onChange({
      ...value,
      [key]: newValue
    });
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 4 }}>
        <Text type={isError ? 'danger' : undefined}>{fieldProps.label}</Text>
      </div>
      <Row gutter={8}>
        <Col>
          <Select
            value={value.province || undefined}
            onChange={v => handleChange('province', v)}
            placeholder="省份"
            style={{ width: 120 }}
            options={[
              { value: '北京市', label: '北京市' },
              { value: '上海市', label: '上海市' },
              { value: '广东省', label: '广东省' },
              { value: '浙江省', label: '浙江省' }
            ]}
          />
        </Col>
        <Col>
          <Select
            value={value.city || undefined}
            onChange={v => handleChange('city', v)}
            placeholder="城市"
            style={{ width: 120 }}
            options={[
              { value: '朝阳区', label: '朝阳区' },
              { value: '海淀区', label: '海淀区' },
              { value: '浦东新区', label: '浦东新区' },
              { value: '天河区', label: '天河区' }
            ]}
          />
        </Col>
        <Col>
          <AntInput value={value.detail || ''} onChange={e => handleChange('detail', e.target.value)} placeholder="详细地址" style={{ width: 200 }} />
        </Col>
      </Row>
      {fieldProps.errMsg && (
        <Text type="danger" style={{ fontSize: 12 }}>
          {fieldProps.errMsg}
        </Text>
      )}
    </div>
  );
};

const TimeRangeField = props => {
  const fieldProps = useField(props);
  const isError = fieldProps.errState === 2;
  const value = fieldProps.value || { start: '', end: '' };

  const handleChange = (key, newValue) => {
    fieldProps.onChange({
      ...value,
      [key]: newValue
    });
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 4 }}>
        <Text type={isError ? 'danger' : undefined}>{fieldProps.label}</Text>
      </div>
      <Space>
        <AntInput type="time" value={value.start || ''} onChange={e => handleChange('start', e.target.value)} placeholder="开始时间" style={{ width: 150 }} />
        <Text>至</Text>
        <AntInput type="time" value={value.end || ''} onChange={e => handleChange('end', e.target.value)} placeholder="结束时间" style={{ width: 150 }} />
      </Space>
      {fieldProps.errMsg && (
        <div>
          <Text type="danger" style={{ fontSize: 12 }}>
            {fieldProps.errMsg}
          </Text>
        </div>
      )}
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

// ========================================
// FormInner 组件：在内部使用 useFormApi
// ========================================

const FormInner = () => {
  const { openApi: formApi } = useFormApi();
  const formData = formApi.getFormData();

  return (
    <Card type="inner" title="FormInner 组件 (使用 useFormApi)" style={{ marginBottom: 16 }}>
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="当前表单数据">
          <Text code>{JSON.stringify(formData)}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="操作">
          <Space wrap>
            <Button
              size="small"
              onClick={() => {
                const name = formData.name || '默认姓名';
                formApi.setField({ name: 'name', value: name + '_modified' });
                message.success('已修改 name 字段');
              }}>
              修改姓名
            </Button>
            <Button
              size="small"
              onClick={() => {
                formApi.setFields([
                  { name: 'email', value: 'default@example.com' },
                  { name: 'phone', value: '13800138000' }
                ]);
                message.success('已批量设置字段');
              }}>
              批量设置
            </Button>
            <Button
              size="small"
              onClick={() => {
                formApi.reset();
                message.info('表单已重置');
              }}>
              重置表单
            </Button>
          </Space>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

// ========================================
// 主示例
// ========================================

const BaseExample = () => {
  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Card title="defaultValue 初值示例">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text type="secondary">通过 defaultValue 为表单字段设置初始值，支持基础类型和对象类型</Text>

          <ReactForm
            debug
            onSubmit={async data => {
              await new Promise(resolve => setTimeout(resolve, 1000));
              console.log('submit:', data);
              message.success('提交成功');
            }}>
            <FormInner />

            <Divider>基础类型 defaultValue</Divider>

            <Input name="name" label="姓名" rule="REQ LEN-0-10" defaultValue="张三" placeholder="请输入姓名" />
            <Input name="email" label="邮箱" rule="REQ EMAIL" defaultValue="zhangsan@example.com" placeholder="请输入邮箱" />
            <Input name="phone" label="手机号" rule="REQ TEL" defaultValue="13900139000" placeholder="请输入手机号" />

            <Divider>Object 类型 defaultValue</Divider>

            <AddressField
              name="address"
              label="地址"
              rule="REQ"
              defaultValue={{
                province: '北京市',
                city: '朝阳区',
                detail: '望京街道'
              }}
            />
            <TimeRangeField
              name="workTime"
              label="工作时间"
              defaultValue={{
                start: '09:00',
                end: '18:00'
              }}
            />

            <Divider />

            <Space>
              <SubmitButton>提交</SubmitButton>
              <ResetButton />
            </Space>
          </ReactForm>
        </Space>
      </Card>
    </div>
  );
};

render(<BaseExample />);
