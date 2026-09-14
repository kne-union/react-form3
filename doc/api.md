### Form 组件 API

#### 属性

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| data | 表单初始值（只影响尚未挂载的字段；不会重放已挂载字段）。按**内容**比较，仅引用变化且内容相同不重置 initFormData | object | {} |
| rules | 自定义验证规则 | object | {} |
| interceptors | 表单拦截器配置 | object | {} |
| debug | 是否开启调试模式 | boolean | false |
| noFilter | 是否关闭空值过滤 | boolean | false |
| onPrevSubmit | 提交前回调 | function(values, form) | - |
| onSubmit | 提交回调 | function(values) | Promise |
| onError | 错误回调 | function(errors) | - |
| onFormDataChange | 表单数据变化回调（同一轮多次值变更合并为一次；参数为当前已挂载字段汇总） | function(formData) | - |
| children | 表单内容 | React.ReactNode | - |

#### Ref 暴露的方法

| 方法名 | 说明 | 参数 | 返回值 |
|-----|----|----|-----|
| submit | 提交表单 | - | void |
| data | 获取表单数据 | - | object |
| set data(data) | 设置表单数据 | object | void |
| reset | 重置表单 | - | void |
| errors | 获取错误信息 | - | array |
| isPass | 表单是否通过验证 | - | boolean |
| setFormData | 设置表单数据 | (data, runValidate?) | void |
| getFormData | 获取表单数据 | - | object |
| setFields | 批量设置字段属性 | (fields, options?) | void |
| setField | 设置单个字段属性 | (field, options?) | void |
| setFieldValue | 设置字段值 | (target, value, options?) | void |
| setFieldValidate | 设置字段验证状态 | (target, validate) | void |
| getField | 获取指定字段 | (target) | Field |
| getFields | 获取匹配的字段列表 | (target) | Field[] |
| validateField | 验证指定字段 | (target) | void |
| validateAll | 验证所有字段 | - | void |
| onReady | 表单就绪回调（若已 mount 则立即执行） | callback | - |
| onDestroy | 表单销毁回调（若已卸载则立即执行） | callback | - |
| forgetField | 清除某字段 pending，重建时不回填 | (target) | void |
| forgetFields | 批量 forget | (targets) | void |
| registerDeclaredPaths | FieldList 登记声明 path（内部） | (sourceId, paths) | void |
| unregisterDeclaredPaths | 取消声明源（内部） | (sourceId) | void |

### useField Hook API

#### 参数

| 参数名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| name | 字段名称 | string | - |
| label | 字段标签 | string | - |
| rule | 验证规则字符串 | string | - |
| interceptor | 字段拦截器配置 | object | {} |
| associations | 字段关联配置（`fields` 变化会同步到已挂载字段；callback 始终读最新） | object | {} |
| noTrim | 是否不自动去空格 | boolean | false |
| debounce | 防抖延迟时间 | number | 0 |
| defaultValue | 默认值 | any | - |
| preserve | 卸载时是否写入 pending 以便重建回填，默认 true | boolean | true |
| errMsg | 自定义错误信息 | string | - |
| onChange | 值变化回调 | function(value) | - |

#### 返回值

| 属性名 | 说明 | 类型 |
|-----|----|----|
| id | 字段唯一标识 | string |
| name | 字段名称 | string |
| label | 字段标签 | string |
| value | 字段值 | any |
| fieldRef | 字段 ref | RefObject |
| formData | 表单数据 | object |
| formState | 表单状态 | Map |
| rule | 验证规则 | string |
| groupName | 分组名称 | string |
| groupIndex | 分组索引 | number |
| onChange | 值变化处理函数 | function |
| isValueChanged | 是否值已改变 | boolean |
| triggerValidate | 触发验证 | function |
| associationOptions | 关联选项 | object |
| errState | 错误状态 (0未验证, 1通过, 2错误, 3验证中) | number |
| errMsg | 错误信息 | string |

### useSubmit Hook API

#### 返回值

| 属性名 | 说明 | 类型 |
|-----|----|----|
| isLoading | 是否正在提交 | boolean |
| isPass | 表单是否通过验证 | boolean |
| onClick | 提交点击处理函数 | function |

### useReset Hook API

#### 返回值

| 属性名 | 说明 | 类型 |
|-----|----|----|
| onClick | 重置点击处理函数 | function |

### useFormApi Hook API

#### 返回值

与 Form 组件 ref 暴露的方法相同，返回 openApi 对象。

### Group 组件 API

#### 属性

| 属性名 | 说明 | 类型 |
|-----|----|----|
| id | 分组唯一标识 | string |
| name | 分组名称 | string |
| defaultValue | 分组默认值 | object |
| children | 渲染函数 | function({ id, name, group, index }) |

#### children 参数

| 参数名 | 说明 | 类型 |
|-----|----|----|
| id | 分组唯一标识 | string |
| name | 完整分组名称 | string |
| group | 分组数据 | object |
| index | 分组索引 | number |

### GroupList 组件 API

#### 属性

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| name | 分组列表名称 | string | - |
| defaultLength | 没有数组时的初始条数；已有数组（含空数组）以数组长度为准，不再垫长 | number | 1 |
| empty | 空列表时显示的内容 | ReactNode | - |
| reverseOrder | 是否倒序显示 | boolean | true |
| children | 渲染函数 | function | - |
| ref | ref 对象 | RefObject | - |

#### children 参数

| 参数名 | 说明 | 类型 |
|-----|----|----|
| id | 分组项唯一标识 | string |
| index | 分组项索引 | number |
| length | 分组列表总长度 | number |
| onAdd | 添加分组项 | function(options) |
| onRemove | 删除当前分组项 | function |

#### ref 暴露的方法

| 方法名 | 说明 | 参数 |
|-----|----|----|
| onAdd | 添加分组项 | function({ isUnshift?, defaultValue? }) |
| onRemove | 删除分组项 | function(id) |

### 内置验证规则

| 规则名 | 说明 | 格式 | 示例 |
|-----|----|----|-----|
| REQ | 必填验证 | REQ | rule="REQ" |
| TEL | 手机号验证 | TEL | rule="TEL" |
| EMAIL | 邮箱验证 | EMAIL | rule="EMAIL" |
| LEN | 长度验证 | LEN-{min}-{max} | rule="LEN-3-10" |

#### 验证规则格式说明

- 验证规则通过空格分隔，可组合多个规则
- LEN 规则格式：LEN-{最小长度}-{最大长度}，若最小等于最大则表示精确长度

### 全局拦截器 API

#### 注册拦截器

| 方法名 | 说明 | 参数 | 返回值 |
|-----|----|----|-----|
| interceptors.input.use | 注册输入拦截器 | (name, function) | number |
| interceptors.output.use | 注册输出拦截器 | (name, function) | number |

#### 使用示例

```javascript
import { interceptors } from '@kne/react-form';

// 注册输入拦截器（在值存入表单前执行）
interceptors.input.use('trim', value => value.trim());
interceptors.input.use('number', value => Number(value));

// 注册输出拦截器（在值从表单取出时执行）
interceptors.output.use('formatDate', value => {
  return value ? new Date(value).toISOString() : value;
});
```

### 赋值与字段重建

- `setField` / `setFormData` 会写入 pending。字段尚未注册或仍处于 PRE_INIT 时不会丢弃；挂载后按 **pending > data 初值 > defaultValue** 回填。
- 字段卸载时（`preserve !== false`）把当前值写入 pending。React key 变化导致的重建会回填；`getFormData` 仍只汇总**当前已挂载**字段。
- FieldList 会把未 `filter` 的 list（含 `display={false}` / `hidden`）登记为声明 path。pending 里有、声明和挂载都没有的 path，对账后 forget（从 list 里 spread 掉或 GroupList 删除）。
- 类型切换后必须清空下游时，在 `onChange` 里调用 `forgetField` / `setField({ name, value: undefined })`，不要依赖卸载推断。
- `hidden`：仍在声明内，值保留。`display={false}`：仍在声明内，再显示能回填。从 list 删除：离开声明，forget。
- `reset` 与 Form 卸载会清空 pending。`debug` 下 `setField` 未匹配到字段且**没有**写入 pending 时才会 `console.warn`。

稳定性单测（`src/__tests__`，入口 `npm test`）：

- `createSetFieldsEvent`：未注册 / PRE_INIT / ready / falsy / 分组 path / debug 写入 pending 不 warn
- `FormEvent` / `useOpenApi`：onFormDataChange 合并触发；已 mount 的 onReady 立即回调
- `formFixes`：data 仅引用变化不重置 init
- `GroupList`：defaultLength 不垫短数组；增删 clone 写回 init、不 splice 原数组
- `Field`：computedFormDataFormState / stateToError 同一 Map 原地改值可读到新值
- `associations` / `useFieldInit` / `createFieldChangeEvent`：空 fields 不匹配；fields 变化后同步
- `createFieldRemoveEvent`：preserve 默认写入 pending、`preserve={false}`、已 forget 不再写回
- `createForgetGroupEvent` / `createResetEvent`
- `fieldAssignLifecycle`：先 setField 后挂载、同 path 卸载再挂、声明消失、forget 后不回填
- `pendingFormData`：对账、forgetByPrefix、mergeFormData
