const { default: ReactForm, useField, useFormApi, useSubmit, useReset } = _ReactForm;
const { useState, useEffect, useMemo, Profiler } = React;
const { Button, Space, Card, Flex, Input: AntInput, Segmented, Statistic, Alert, Collapse, Tag, Badge, Typography, Switch, message } = antd;
const { Text, Paragraph } = Typography;

// ========================================
// 渲染统计：字段组件在渲染阶段累加计数，Profiler 在 commit 阶段累加耗时
// ========================================

const stats = {
  fieldRenders: 0,
  mountDuration: 0,
  mounting: false,
  inputStartRenders: 0,
  inputCommits: 0,
  inputDuration: 0,
  opCount: 0,
  opDuration: 0,
  measuring: false,
  listener: null,
  notify(patch) {
    this.listener && this.listener(patch);
  }
};

const resetStats = () => {
  clearTimeout(stats.settleTimer);
  stats.fieldRenders = 0;
  stats.opCount = 0;
  stats.opDuration = 0;
  stats.measuring = false;
  stats.notify({ lastInput: null, totalRenders: 0, ops: null });
};

const startMeasure = () => {
  if (stats.measuring) {
    return;
  }
  stats.measuring = true;
  stats.inputStartRenders = stats.fieldRenders;
  stats.inputCommits = 0;
  stats.inputDuration = 0;
};

const flushInputStats = () => {
  clearTimeout(stats.settleTimer);
  stats.measuring = false;
  stats.opCount++;
  stats.opDuration += stats.inputDuration;
  stats.notify({
    lastInput: {
      renders: stats.fieldRenders - stats.inputStartRenders,
      commits: stats.inputCommits,
      duration: stats.inputDuration
    },
    totalRenders: stats.fieldRenders,
    ops: { count: stats.opCount, avg: stats.opDuration / stats.opCount }
  });
};

// 挂载后还有字段注册引起的若干 commit，一并计入挂载耗时，直到稳定 100ms
const scheduleMountSettle = () => {
  clearTimeout(stats.mountTimer);
  stats.mountTimer = setTimeout(() => {
    stats.mounting = false;
    stats.notify({ mountDuration: stats.mountDuration, totalRenders: stats.fieldRenders });
  }, 100);
};

const onProfilerRender = (id, phase, actualDuration) => {
  if (phase === 'mount') {
    stats.mounting = true;
    stats.mountDuration = actualDuration;
    stats.notify({ mountDuration: actualDuration, totalRenders: stats.fieldRenders });
    scheduleMountSettle();
    return;
  }
  if (stats.mounting && !stats.measuring) {
    stats.mountDuration += actualDuration;
    scheduleMountSettle();
    return;
  }
  if (!stats.measuring) {
    return;
  }
  stats.inputCommits++;
  stats.inputDuration += actualDuration;
  clearTimeout(stats.settleTimer);
  stats.settleTimer = setTimeout(flushInputStats, 100);
};

// ========================================
// 字段数据：按业务字段类型循环生成，每类有校验规则、合法初值与故意写错的初值
// ========================================

const FIELD_TYPES = [
  { label: '客户名称', rule: 'REQ LEN-2-30', valid: n => `星河科技有限公司${n}`, invalid: () => '星' },
  { label: '联系人', rule: 'REQ LEN-2-10', valid: n => `张${n}`, invalid: () => '' },
  { label: '手机号', rule: 'REQ TEL', valid: n => `138${String(n).padStart(8, '0')}`, invalid: () => '12345' },
  { label: '邮箱', rule: 'REQ EMAIL', valid: n => `contact${n}@example.com`, invalid: () => 'contact@' },
  { label: '纳税人识别号', rule: 'REQ LEN-18-18', valid: n => `91110000${String(n).padStart(10, '0')}`, invalid: () => '9111' },
  { label: '备注', rule: 'LEN-0-50', valid: () => '', invalid: () => '备注'.repeat(30) }
];

const INVALID_EVERY = 10;

const createFieldList = count =>
  Array.from({ length: count }, (_, index) => {
    const type = FIELD_TYPES[index % FIELD_TYPES.length];
    const group = Math.floor(index / FIELD_TYPES.length) + 1;
    return {
      name: `item_${index + 1}`,
      label: `${type.label}-${group}`,
      rule: type.rule,
      type,
      initValue: index % INVALID_EVERY === INVALID_EVERY - 1 ? type.invalid(group) : type.valid(group)
    };
  });

const createFormData = fieldList => Object.fromEntries(fieldList.map(({ name, initValue }) => [name, initValue]));

// ========================================
// 字段展示
// ========================================

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: 12,
  maxHeight: 520,
  overflow: 'auto',
  padding: 2
};

const FieldCell = ({ fieldProps, extra, ...inputProps }) => {
  const isError = fieldProps.errState === 2;
  return (
    <div
      style={{
        padding: '8px 10px',
        borderRadius: 6,
        border: `1px solid ${isError ? '#ffccc7' : '#f0f0f0'}`,
        background: isError ? '#fff2f0' : '#fafafa',
        minWidth: 0
      }}
    >
      <Flex justify="space-between" align="center" gap={4} style={{ marginBottom: 6 }}>
        <Text strong ellipsis style={{ fontSize: 13 }}>
          {fieldProps.label}
        </Text>
        <Tag bordered={false} style={{ marginInlineEnd: 0, fontSize: 11 }}>
          {fieldProps.rule}
        </Tag>
      </Flex>
      <AntInput ref={fieldProps.fieldRef} size="small" value={fieldProps.value ?? ''} status={isError ? 'error' : undefined} {...inputProps} />
      <Flex justify="space-between" style={{ height: 18, marginTop: 2 }}>
        <Text type="danger" ellipsis style={{ fontSize: 12 }}>
          {isError ? fieldProps.errMsg || '校验未通过' : ''}
        </Text>
        {extra}
      </Flex>
    </div>
  );
};

// 反例写法：字段内读取 formData 派生内容，每次输入都立即校验
const BadInput = props => {
  stats.fieldRenders++;
  const fieldProps = useField(props);
  const filledCount = Object.values(fieldProps.formData || {}).filter(value => value !== undefined && value !== '').length;

  return (
    <FieldCell
      fieldProps={fieldProps}
      extra={
        <Text type="secondary" style={{ fontSize: 12, flexShrink: 0 }}>
          已填 {filledCount}
        </Text>
      }
      onChange={e => {
        fieldProps.onChange(e.target.value);
        fieldProps.triggerValidate();
      }}
    />
  );
};

// 推荐写法：字段只关心自身值，校验加 debounce，整表数据按需读取
const GoodInput = props => {
  stats.fieldRenders++;
  const fieldProps = useField(Object.assign({ debounce: 300 }, props));

  return (
    <FieldCell
      fieldProps={fieldProps}
      onChange={e => {
        fieldProps.onChange(e.target.value);
        fieldProps.triggerValidate();
      }}
      onBlur={fieldProps.triggerValidate}
    />
  );
};

// ========================================
// 表单工具栏：放在 ReactForm 内以便使用 useFormApi
// ========================================

const AUTO_INTERVAL = 200;

// 开关状态放在表单内的独立组件里，拨动开关不会让整张表单重渲染而污染统计
const AutoMutator = ({ fieldList }) => {
  const { openApi } = useFormApi();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const timer = setInterval(() => {
      // 上一次修改引起的 commit（含校验）未结算完则跳过本轮，保证每次统计完整归属
      if (stats.measuring) {
        return;
      }
      const { name, type } = fieldList[Math.floor(Math.random() * fieldList.length)];
      const seed = Math.floor(Math.random() * 9999) + 1;
      const value = Math.random() < 1 / INVALID_EVERY ? type.invalid(seed) : type.valid(seed);
      startMeasure();
      openApi.setFieldValue({ name }, value);
    }, AUTO_INTERVAL);
    return () => clearInterval(timer);
  }, [enabled, fieldList, openApi]);

  return (
    <Space size={6}>
      <Switch size="small" checked={enabled} onChange={setEnabled} />
      <Badge status={enabled ? 'processing' : 'default'} text={enabled ? `自动随机修改中（${AUTO_INTERVAL}ms）` : '自动随机修改'} />
    </Space>
  );
};

const FormToolbar = ({ fieldList, showSummary }) => {
  const { openApi } = useFormApi();
  const { onClick: submit, isLoading } = useSubmit();
  const { onClick: reset } = useReset();
  const [summary, setSummary] = useState(null);

  const measure = action => () => {
    startMeasure();
    action();
  };

  return (
    <Flex wrap="wrap" gap={8} align="center">
      <AutoMutator fieldList={fieldList} />
      {showSummary && (
        <Button
          size="small"
          onClick={() => {
            const formData = openApi.getFormData();
            setSummary(Object.values(formData).filter(value => value !== undefined && value !== '').length);
          }}
        >
          按需读取表单数据{summary !== null ? `（已填 ${summary}）` : ''}
        </Button>
      )}
      <Button size="small" onClick={measure(() => openApi.validateAll())}>
        全部校验
      </Button>
      <Button size="small" onClick={measure(reset)}>
        重置
      </Button>
      <Button size="small" type="primary" loading={isLoading} onClick={measure(submit)}>
        提交
      </Button>
    </Flex>
  );
};

// ========================================
// 统计面板：独立持有 state，刷新统计时不会让表单重渲染而污染计数
// ========================================

const statGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
  gap: 12
};

const StatCard = ({ title, ...props }) => (
  <Card size="small" styles={{ body: { padding: '10px 14px' } }}>
    <Statistic
      title={
        <Text type="secondary" style={{ fontSize: 12 }}>
          {title}
        </Text>
      }
      valueStyle={{ fontSize: 22 }}
      {...props}
    />
  </Card>
);

const StatsPanel = ({ fieldCount }) => {
  const [state, setState] = useState({ mountDuration: 0, lastInput: null, totalRenders: 0, ops: null });

  useEffect(() => {
    stats.listener = patch => setState(current => Object.assign({}, current, patch));
    stats.notify({ mountDuration: stats.mountDuration, totalRenders: stats.fieldRenders });
    return () => {
      stats.listener = null;
    };
  }, []);

  const { mountDuration, lastInput, totalRenders, ops } = state;
  const renderColor = lastInput ? (lastInput.renders > fieldCount ? '#cf1322' : lastInput.renders >= fieldCount ? '#d46b08' : '#389e0d') : undefined;

  return (
    <div style={statGridStyle}>
      <StatCard title="挂载耗时（含字段注册）" value={mountDuration} precision={1} suffix="ms" />
      <StatCard
        title="最近一次操作 · 字段渲染次数"
        value={lastInput ? lastInput.renders : '-'}
        valueStyle={{ fontSize: 22, color: renderColor }}
        suffix={
          lastInput ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              / {fieldCount} 个字段
            </Text>
          ) : null
        }
      />
      <StatCard
        title="最近一次操作 · commit 耗时"
        value={lastInput ? lastInput.duration : '-'}
        precision={1}
        suffix={
          lastInput ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              ms · {lastInput.commits} 次 commit
            </Text>
          ) : null
        }
      />
      <StatCard
        title="累计操作 · 平均 commit 耗时"
        value={ops ? ops.avg : '-'}
        precision={1}
        suffix={
          ops ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              ms · 共 {ops.count} 次
            </Text>
          ) : null
        }
      />
      <StatCard title="累计字段渲染次数" value={totalRenders} />
    </div>
  );
};

// ========================================
// 压测面板
// ========================================

const MODE_OPTIONS = [
  { label: '反例：字段读 formData + 每键校验', value: 'bad' },
  { label: '推荐：按需读取 + debounce 校验', value: 'good' }
];

const PerfExample = () => {
  const [count, setCount] = useState(100);
  const [mode, setMode] = useState('bad');

  const fieldList = useMemo(() => createFieldList(count), [count]);
  const formData = useMemo(() => createFormData(fieldList), [fieldList]);
  const FieldComponent = mode === 'bad' ? BadInput : GoodInput;

  return (
    <Flex vertical gap={16}>
      <Alert
        type="warning"
        showIcon
        message="当前版本：任一字段变化都会让表单内所有字段重渲染，字段数为 n 时一次操作的字段渲染次数是 n 的整数倍"
        description={
          <Collapse
            ghost
            size="small"
            style={{ marginInline: -16 }}
            items={[
              {
                key: 'detail',
                label: '原理说明与使用建议',
                children: (
                  <div>
                    <Paragraph style={{ marginBottom: 6 }}>
                      <Text strong>渲染：</Text>字段状态集中存放在 Form 的 formState 中并通过 context 下发，单个字段变化会生成新的 formState，所有 useField 消费者在同一次 commit 中重渲染，且每个字段渲染时都会重新计算一次整表 formData。
                    </Paragraph>
                    <Paragraph style={{ marginBottom: 6 }}>
                      <Text strong>校验：</Text>字符串规则（如 REQ TEL）中每条非 REQ 规则执行前都会调用 getFormData() 重新汇总整表数据，「全部校验」「提交」的成本约为 字段数 × 规则数 × 字段数。初值中每 {INVALID_EVERY}{' '}
                      个字段故意放了一个不合规的值。
                    </Paragraph>
                    <Paragraph style={{ marginBottom: 0 }}>
                      <Text strong>建议：</Text>字段内不要依赖 formData 渲染，需要整表数据时用 useFormApi().openApi.getFormData() 按需读取；校验设置 debounce；GroupList 项数较多时分页或虚拟滚动；noFilter 非必要不开启。
                    </Paragraph>
                  </div>
                )
              }
            ]}
          />
        }
      />

      <Card size="small">
        <Flex wrap="wrap" gap={16} align="center" justify="space-between">
          <Flex wrap="wrap" gap={16} align="center">
            <Space>
              <Text type="secondary">字段数</Text>
              <Segmented
                value={count}
                options={[50, 100, 200, 400]}
                onChange={value => {
                  resetStats();
                  setCount(value);
                }}
              />
            </Space>
            <Space>
              <Text type="secondary">写法</Text>
              <Segmented
                value={mode}
                options={MODE_OPTIONS}
                onChange={value => {
                  resetStats();
                  setMode(value);
                }}
              />
            </Space>
          </Flex>
          <Button onClick={resetStats}>清零统计</Button>
        </Flex>
      </Card>

      <StatsPanel fieldCount={count} />

      <Profiler key={`${count}-${mode}`} id="perf-form" onRender={onProfilerRender}>
        <ReactForm
          data={formData}
          onSubmit={data => {
            message.success(`提交成功，共 ${Object.keys(data).length} 个非空字段`);
          }}
          onError={errors => {
            message.error(`校验未通过：${errors.length} 个字段有误`);
          }}
        >
          <Card
            size="small"
            title={
              <Space>
                <span>表单</span>
                <Tag color={mode === 'bad' ? 'error' : 'success'}>{mode === 'bad' ? '反例写法' : '推荐写法'}</Tag>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 'normal' }}>
                  {count} 个字段 · 输入字符或点击按钮后统计自动刷新
                </Text>
              </Space>
            }
            extra={<FormToolbar fieldList={fieldList} showSummary={mode === 'good'} />}
            styles={{ header: { flexWrap: 'wrap', gap: 8, paddingBlock: 8 } }}
          >
            <div style={gridStyle} onInputCapture={startMeasure}>
              {fieldList.map(({ name, label, rule }) => (
                <FieldComponent key={name} name={name} label={label} rule={rule} />
              ))}
            </div>
          </Card>
        </ReactForm>
      </Profiler>
    </Flex>
  );
};

render(<PerfExample />);
