const { default: ReactForm, useField, useSubmit, useReset } = _ReactForm;
const { useState, useEffect } = React;
const { Button, Space, Card, Input: AntInput, Typography, Alert, message, List, Tag, Divider, Descriptions } = antd;
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
        <AntInput ref={fieldProps.fieldRef} type="text" value={fieldProps.value || ''} onChange={e => fieldProps.onChange(e.target.value)} onBlur={fieldProps.triggerValidate} status={isError ? 'error' : undefined} style={{ width: 200 }} />
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

// 校验日志组件
const ValidationLog = () => {
  const [logs, setLogs] = useState([]);
  const listRef = React.useRef(null);

  useEffect(() => {
    // 拦截 console.log 来捕获验证日志
    const originalLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('验证')) {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { id: Date.now() + Math.random(), timestamp, message }]);
      }
      originalLog.apply(console, args);
    };
    return () => {
      console.log = originalLog;
    };
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [logs]);

  const clearLogs = () => setLogs([]);

  return (
    <Card title="远程校验过程" size="small" style={{ marginBottom: 20 }}>
      <Space style={{ marginBottom: 12 }}>
        <Button size="small" onClick={clearLogs}>清空日志</Button>
        <Text type="secondary" style={{ fontSize: 12 }}>共 {logs.length} 条记录</Text>
      </Space>
      <div ref={listRef} style={{ height: 300, overflowY: 'auto', border: '1px solid #f0f0f0', borderRadius: 4 }}>
        {logs.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              暂无验证日志，请在上方输入框中输入内容触发验证
            </Text>
          </div>
        ) : (
          <List
            size="small"
            dataSource={logs}
            renderItem={item => {
              const isStart = item.message.includes('开始验证');
              const isComplete = item.message.includes('验证完成');
              return (
                <List.Item style={{ padding: '8px 12', borderBottom: '1px solid #f0f0f0' }}>
                  <Space>
                    <Text type="secondary" style={{ fontSize: 11, minWidth: 70 }}>{item.timestamp}</Text>
                    <Tag color={isStart ? 'blue' : isComplete ? 'green' : 'default'} style={{ margin: 0 }}>
                      {isStart ? '开始' : isComplete ? '完成' : '其他'}
                    </Tag>
                    <Text style={{ fontSize: 12 }}>{item.message}</Text>
                  </Space>
                </List.Item>
              );
            }}
          />
        )}
      </div>
    </Card>
  );
};

// 模拟用户名重复检查的远程验证规则
const checkUsernameUnique = async value => {
  if (!value) {
    return { result: false, errMsg: '用户名不能为空' };
  }

  // 模拟已存在的用户名
  const existingUsernames = ['admin', 'test', 'user', 'root'];

  console.log(`开始验证用户名: ${value}`);
  await new Promise(resolve => setTimeout(resolve, 1500));
  console.log(`验证完成用户名: ${value}`);

  if (existingUsernames.includes(value)) {
    return { result: false, errMsg: '该用户名已被占用' };
  }

  return { result: true, errMsg: '' };
};

// 模拟手机号有效性检查的远程验证规则
const checkPhoneValid = async value => {
  if (!value) {
    return { result: false, errMsg: '手机号不能为空' };
  }

  console.log(`开始验证手机号: ${value}`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`验证完成手机号: ${value}`);

  // 模拟手机号黑名单
  const blackList = ['13800138000', '13900139000'];

  if (blackList.includes(value)) {
    return { result: false, errMsg: '该手机号已被注册' };
  }

  return { result: true, errMsg: '' };
};

const BaseExample = () => {
  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Card title="远程验证规则示例" bordered={false}>
        <Alert message="异步验证说明" description="示例展示了如何使用自定义的异步验证规则来模拟远程接口验证" type="info" showIcon style={{ marginBottom: 20 }} />

        <ValidationLog />

        <Card type="inner" title="特殊输入值说明" size="small" style={{ marginBottom: 20, backgroundColor: '#fff7e6' }}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="已占用用户名">
              <Space>
                <Tag color="red">admin</Tag>
                <Tag color="red">test</Tag>
                <Tag color="red">user</Tag>
                <Tag color="red">root</Tag>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="已注册手机号">
              <Space>
                <Tag color="red">13800138000</Tag>
                <Tag color="red">13900139000</Tag>
              </Space>
            </Descriptions.Item>
          </Descriptions>
          <Text type="secondary" style={{ fontSize: 12 }}>
            💡 输入以上值会触发验证失败，用于测试错误提示和校验过程
          </Text>
        </Card>

        <ReactForm
          debug
          rules={{
            CHECK_USERNAME: checkUsernameUnique,
            CHECK_PHONE: checkPhoneValid
          }}
          data={{
            username: '',
            phone: ''
          }}
          onSubmit={async data => {
            console.log('提交数据:', data);
            await new Promise(resolve => setTimeout(resolve, 2000));
            message.success('注册成功: ' + JSON.stringify(data, null, 2));
          }}>
          <Input name="username" label="用户名" rule="REQ LEN-3-20 CHECK_USERNAME" placeholder="请输入用户名" />
          <Input name="phone" label="手机号" rule="REQ TEL CHECK_PHONE" placeholder="请输入手机号" />

          <div style={{ marginTop: 20 }}>
            <Space>
              <SubmitButton>注册</SubmitButton>
              <ResetButton />
            </Space>
          </div>
        </ReactForm>
      </Card>
    </div>
  );
};

render(<BaseExample />);
