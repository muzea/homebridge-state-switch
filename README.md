# Homebridge State Switch Plugin

一个配合可编程开关的插件

[一个可以配合使用的 ESP8266 固件](https://github.com/muzea/homebridge-state-switch-esp8266)

# 配置项

## name

开关的名字，获取/设置开关的状态会用到

## api

提供开关状态查询/设置的 HTTP 服务

该服务需要实现两个操作

### 查询状态

```
GET /<API_PATH>
```

返回值为


状态为 开
```
{"<name>":"on"}
```

状态为 关
```
{"<name>":"off"}
```

### 设置状态

设置为 开
```
PUT /<API_PATH>

{"<name>":"on"}
```

设置为 关
```
PUT /<API_PATH>

{"<name>":"off"}
```
