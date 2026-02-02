const { default: ReactForm, useField, useSubmit, useReset, GroupList } = _ReactForm;
const { useRef } = React;
const { Button, Space, Card, Input: AntInput, Tag, Typography, message } = antd;
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
          {...fieldProps.associationOptions}
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
  const ref = useRef(null);
  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Card title="字段关联示例" bordered={false}>
        <ReactForm
          debug
          onSubmit={data => {
            console.log('submit:', data);
            message.success('提交成功: ' + JSON.stringify(data, null, 2));
          }}
        >
          <Card type="inner" title={<Space>1. 单字段关联<Tag color="blue">描述跟随名称</Tag></Space>} style={{ marginBottom: 16 }}>
            <Input name="name" label="名称" rule="REQ LEN-0-10" />
            <Input
              name="des"
              label="描述"
              rule="LEN-0-10"
              associations={{
                fields: [{ name: 'name' }],
                callback: ({ target, origin }) => {
                  return origin.value;
                }
              }}
            />
          </Card>

          <Card type="inner" title={<Space>2. 多字段关联<Tag color="green">姓名拼接全名</Tag></Space>} style={{ marginBottom: 16 }}>
            <Space wrap>
              <Input name="familyName" label="姓" rule="REQ LEN-0-10" />
              <Input name="firstName" label="名" rule="REQ LEN-0-10" />
            </Space>
            <Input
              name="fullName"
              label="全名"
              rule="LEN-0-20"
              associations={{
                fields: [{ name: 'familyName' }, { name: 'firstName' }],
                callback: ({ target, openApi }) => {
                  const { firstName, familyName } = openApi.getFormData();
                  return firstName && familyName ? `${familyName}${firstName}` : '';
                }
              }}
            />
          </Card>

          <Card type="inner" title={<Space>3. 计算关联<Tag color="orange">金额除以比例</Tag></Space>} style={{ marginBottom: 16 }}>
            <Space wrap>
              <Input name="money" label="总金额" />
              <Input name="ratio" label="比例" />
            </Space>
            <Input
              name="all"
              label="每份金额"
              associations={{
                fields: [{ name: 'money' }, { name: 'ratio' }],
                callback: ({ target, openApi }) => {
                  const { money, ratio } = openApi.getFormData();
                  const numMoney = parseFloat(money) || 0;
                  const numRatio = parseFloat(ratio) || 1;
                  return numRatio > 0 ? (numMoney / numRatio).toFixed(2) : '';
                }
              }}
            />
          </Card>

          <Card type="inner" title={<Space>4. 分组关联<Tag color="purple">汇总求和</Tag></Space>} style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={() => ref.current.onAdd()} style={{ marginBottom: 12 }}>
              添加数量项
            </Button>
            <GroupList ref={ref} name="group" defaultLength={2}>
              {({ index, onRemove }) => (
                <Space key={index} style={{ padding: 12, background: '#f0f0f0', borderRadius: 6, marginBottom: 8, width: '100%' }}>
                  <Tag color="blue">项 {index + 1}</Tag>
                  <Input name="sum" label="数量" />
                  <Button danger size="small" onClick={onRemove}>
                    删除
                  </Button>
                </Space>
              )}
            </GroupList>
            <Input
              name="amount"
              label="总数"
              associations={{
                fields: [{ name: 'sum', groupName: 'group' }],
                callback: ({ target, openApi }) => {
                  const { group } = openApi.getFormData();
                  const total = (group || [])
                    .filter(item => item.sum > 0)
                    .reduce((a, b) => a + parseInt(b.sum), 0);
                  return total > 0 ? total.toString() : '';
                }
              }}
            />
          </Card>

          <div style={{ marginTop: 16 }}>
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
