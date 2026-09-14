const { default: ReactForm, useField, useSubmit, useReset, useFormApi } = _ReactForm;
const { useEffect, useState } = React;
const { Button, Space, Card, Input: AntInput, Select: AntSelect, Radio, Switch, Tag, Typography, message } = antd;
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

const SelectField = props => {
  const { options, ...rest } = props;
  const fieldProps = useField(rest);
  const isError = fieldProps.errState === 2;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 4 }}>
        <Text type={isError ? 'danger' : undefined}>{fieldProps.label}</Text>
      </div>
      <AntSelect
        {...fieldProps.associationOptions}
        value={fieldProps.value}
        onChange={value => {
          fieldProps.onChange(value);
          fieldProps.triggerValidate();
        }}
        options={options}
        status={isError ? 'error' : undefined}
        style={{ width: 200 }}
      />
      {fieldProps.errMsg && (
        <Text type="danger" style={{ marginLeft: 8, fontSize: 12 }}>
          {fieldProps.errMsg}
        </Text>
      )}
    </div>
  );
};

const RadioField = props => {
  const { options, ...rest } = props;
  const fieldProps = useField(rest);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 4 }}>
        <Text>{fieldProps.label}</Text>
      </div>
      <Radio.Group
        value={fieldProps.value}
        onChange={e => {
          fieldProps.onChange(e.target.value);
          fieldProps.triggerValidate();
        }}>
        {options.map(item => (
          <Radio key={item.value} value={item.value}>
            {item.label}
          </Radio>
        ))}
      </Radio.Group>
    </div>
  );
};

const SwitchField = props => {
  const fieldProps = useField(props);

  return (
    <div style={{ marginBottom: 16 }}>
      <Space>
        <Switch
          checked={!!fieldProps.value}
          onChange={checked => {
            fieldProps.onChange(checked);
            fieldProps.triggerValidate();
          }}
        />
        <Text>{fieldProps.label}</Text>
      </Space>
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

const useWatch = name => {
  const { openApi, emitter } = useFormApi();
  const [value, setValue] = useState(() => (openApi.getFormData() || {})[name]);

  useEffect(() => {
    const syncFromForm = () => {
      setValue((openApi.getFormData() || {})[name]);
    };
    const onSetValue = payload => {
      if (payload.path === name) {
        setValue(payload.value);
      }
    };
    const setToken = emitter.addListener('form:field:set-value', onSetValue);
    const resetToken = emitter.addListener('form:reset', syncFromForm);
    return () => {
      setToken.remove();
      resetToken.remove();
    };
  }, [emitter, name, openApi]);

  return value;
};

const Watch = ({ name, children }) => children(useWatch(name));

const toCompanyEmail = name => {
  const local = String(name || '').replace(/[^a-zA-Z0-9_.-]/g, '');
  return `${local || 'contact'}@example.com`;
};

const FillOnShow = ({ name, from, map }) => {
  const { openApi } = useFormApi();

  useEffect(() => {
    const data = openApi.getFormData() || {};
    if (data[name] !== undefined && data[name] !== '') {
      return;
    }
    const source = data[from];
    const next = map ? map(source, data) : source;
    if (next === undefined || next === '') {
      return;
    }
    openApi.setField({ name, value: next });
  }, []);

  return null;
};

const AssignButtons = ({ items }) => {
  const { openApi } = useFormApi();

  return (
    <Space wrap style={{ marginBottom: 12 }}>
      {items.map(item => (
        <Button
          key={item.label}
          onClick={() => {
            const data = openApi.getFormData() || {};
            const fields = item.getFields ? item.getFields(data) : item.fields;
            openApi.setFields(fields);
            message.success(`已赋值：${item.label}`);
          }}>
          {item.label}
        </Button>
      ))}
    </Space>
  );
};

const BaseExample = () => {
  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Card title="表单数据联动显示与赋值" bordered={false}>
        <ReactForm
          debug
          onSubmit={data => {
            console.log('submit:', data);
            message.success('提交成功: ' + JSON.stringify(data, null, 2));
          }}>
          <Card
            type="inner"
            title={
              <Space>
                1. 按表单数据条件显示字段<Tag color="blue">隐藏字段卸载</Tag>
              </Space>
            }
            style={{ marginBottom: 16 }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              用 useWatch 读当前表单值，再条件渲染字段。隐藏时卸载，提交不含该字段；再次显示会从 pending 恢复刚才填过的值。
              下方按钮一次 setFields 条件字段和对应输入：当前未挂载的字段会进 pending，切过去就能带出。
            </Text>
            <AssignButtons
              items={[
                {
                  label: '填入邮箱方案',
                  fields: [
                    { name: 'contactType', value: 'email' },
                    { name: 'email', value: 'alice@example.com' }
                  ]
                },
                {
                  label: '填入手机方案',
                  fields: [
                    { name: 'contactType', value: 'phone' },
                    { name: 'phone', value: '13800138000' }
                  ]
                }
              ]}
            />
            <RadioField
              name="contactType"
              label="联系方式"
              defaultValue="email"
              options={[
                { label: '邮箱', value: 'email' },
                { label: '手机', value: 'phone' }
              ]}
            />
            <Watch name="contactType">
              {contactType =>
                contactType === 'email' ? (
                  <Input name="email" label="邮箱" rule="REQ EMAIL" />
                ) : contactType === 'phone' ? (
                  <Input name="phone" label="手机" rule="REQ TEL" />
                ) : null
              }
            </Watch>
          </Card>

          <Card
            type="inner"
            title={
              <Space>
                2. 显示时赋值，并继续跟随<Tag color="green">setField + associations</Tag>
              </Space>
            }
            style={{ marginBottom: 16 }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              打开开关后挂载昵称：FillOnShow 用 setField 把名称抄过去（字段尚未挂载时会写入 pending）；之后名称变化由 associations 同步。
            </Text>
            <AssignButtons
              items={[
                {
                  label: '打开昵称并抄名称',
                  getFields: data => [
                    { name: 'sameAsName', value: true },
                    { name: 'nickname', value: data.name || '示例昵称' }
                  ]
                },
                {
                  label: '关掉昵称只改名称',
                  fields: [
                    { name: 'sameAsName', value: false },
                    { name: 'name', value: '王五' }
                  ]
                }
              ]}
            />
            <Input name="name" label="名称" rule="REQ LEN-0-10" />
            <SwitchField name="sameAsName" label="使用名称作为昵称" />
            <Watch name="sameAsName">
              {sameAsName =>
                sameAsName ? (
                  <>
                    <FillOnShow name="nickname" from="name" />
                    <Input
                      name="nickname"
                      label="昵称"
                      rule="REQ LEN-0-10"
                      associations={{
                        fields: [{ name: 'name' }],
                        callback: ({ target, origin, openApi }) => {
                          openApi.setFieldValue(target, origin.value);
                        }
                      }}
                    />
                  </>
                ) : null
              }
            </Watch>
          </Card>

          <Card
            type="inner"
            title={
              <Space>
                3. 类型切换后显示并计算赋值<Tag color="orange">setField 计算值</Tag>
              </Space>
            }
            style={{ marginBottom: 16 }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              选「企业」后显示公司名和联系邮箱：公司名默认用名称，邮箱按名称拼出示例地址。提交时仅包含当前显示的字段。
            </Text>
            <AssignButtons
              items={[
                {
                  label: '切到企业并填公司信息',
                  getFields: data => [
                    { name: 'userType', value: 'company' },
                    { name: 'companyName', value: data.name ? `${data.name}科技` : '示例科技' },
                    { name: 'companyEmail', value: toCompanyEmail(data.name) }
                  ]
                },
                {
                  label: '切回个人',
                  fields: [{ name: 'userType', value: 'person' }]
                }
              ]}
            />
            <SelectField
              name="userType"
              label="用户类型"
              defaultValue="person"
              options={[
                { label: '个人', value: 'person' },
                { label: '企业', value: 'company' }
              ]}
            />
            <Watch name="userType">
              {userType =>
                userType === 'company' ? (
                  <>
                    <FillOnShow name="companyName" from="name" />
                    <FillOnShow
                      name="companyEmail"
                      from="name"
                      map={name => toCompanyEmail(name)}
                    />
                    <Input
                      name="companyName"
                      label="公司名称"
                      rule="REQ"
                      associations={{
                        fields: [{ name: 'name' }],
                        callback: ({ target, origin, openApi }) => {
                          openApi.setFieldValue(target, origin.value);
                        }
                      }}
                    />
                    <Input
                      name="companyEmail"
                      label="企业邮箱"
                      rule="REQ EMAIL"
                      associations={{
                        fields: [{ name: 'name' }],
                        callback: ({ target, origin, openApi }) => {
                          openApi.setFieldValue(target, toCompanyEmail(origin.value));
                        }
                      }}
                    />
                  </>
                ) : null
              }
            </Watch>
          </Card>

          <Card
            type="inner"
            title={
              <Space>
                4. 按条件整套赋值<Tag color="purple">一次 setFields</Tag>
              </Space>
            }
            style={{ marginBottom: 16 }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              一次写入条件开关和对应字段。隐藏中的字段同样能赋值，切到该条件后从 pending 显示。
            </Text>
            <AssignButtons
              items={[
                {
                  label: '填入完整个人示例',
                  fields: [
                    { name: 'contactType', value: 'email' },
                    { name: 'email', value: 'zhangsan@example.com' },
                    { name: 'name', value: '张三' },
                    { name: 'sameAsName', value: true },
                    { name: 'nickname', value: '张三' },
                    { name: 'userType', value: 'person' }
                  ]
                },
                {
                  label: '填入完整企业示例',
                  fields: [
                    { name: 'contactType', value: 'phone' },
                    { name: 'phone', value: '13900139000' },
                    { name: 'name', value: '李四' },
                    { name: 'sameAsName', value: false },
                    { name: 'userType', value: 'company' },
                    { name: 'companyName', value: '李四科技' },
                    { name: 'companyEmail', value: 'lisi@example.com' }
                  ]
                }
              ]}
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
