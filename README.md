# hemera-monitor
hemera服务监控

### 需要安装jaeger服务
通过 `Docker` 容器安装，所以需要先安装 `Docker`,这里以 `Ubuntu 16.4` 系统为安装实例

####  Docker安装

- 卸载旧版本docker，全新安装时，无需执行该步骤
  ```sh
  sudo apt-get remove docker docker-engine docker.io
  ```

- 更新系统软件
  ```sh
  sudo apt-get update
  ```

- 安装依赖包
  ```sh
  sudo apt-get install \
  apt-transport-https \
  ca-certificates \
  curl \
  software-properties-common
  ```

- 添加官方密钥，执行该命令时，如遇到长时间没有响应说明网络连接不到docker网站，需要使用代-理进行。
  ```sh
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add - # 显示OK,表示添加成功
  ```

- 添加仓库
   ```sh
   sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
   ```

- 再次更新软件，经实践，这一步不能够省略，我们需要再次把软件更新到最新，否则下一步有可能会报错。
   ```sh
   sudo apt-get update
   ```

- 安装docker，如果想指定安装某一版本，可使用 `sudo apt-get install docker-ce=<VERSION>`  命令，把<VERSION>替换为具体版本即可，以下命令没有指定版本，默认就会安装最新版
  ```sh
  sudo apt-get install docker-ce
  ```

- 查看docker版本
  ```sh
  docker -v #显示“Docker version 17.09.0-ce, build afdb6d4”字样，表示安装成功
  ```

####  Docker-compose安装

- 下载 `Docker-compose`
  ```sh
  sudo curl -L https://github.com/docker/compose/releases/download/1.17.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
  ```

- 授权
  ```sh
  sudo chmod +x /usr/local/bin/docker-compose
  ```

- 查看版本信息
  ```sh
  docker-compose --version #显示出版本信息，即安装成功
  ```

#### Docker-machine安装

> 说明：`Docker-machine` 的使用是要基于` virtualBox` 的。如果没有安装安装过，请先安装 `virtualBox`

- 安装virtualBox
 
 > [登录virtualBox官网](https://www.virtualbox.org/wiki/Linux_Downloads) 找到 `Ubuntu 16.04 (Xenial)  i386 |  AMD64` 字样，点击 `AMD64` 进行下载，下载后，执行以下命令进行安装
  ```sh
  sudo dpkg -i virtualbox-5.2_5.2.0-118431_Ubuntu_xenial_amd64.deb
  ```

- 下载并安装Docker-machine
  ```sh
  curl -L https://github.com/docker/machine/releases/download/v0.13.0/docker-machine-`uname -s`-`uname -m` >/tmp/docker-machine &&
  chmod +x /tmp/docker-machine &&
  sudo cp /tmp/docker-machine /usr/local/bin/docker-machine
  ```

- 查看版本信息
  ```sh
  docker-machine version
  ```

**利用 `elasticsearch` 作为存储引擎部署 `jaeger`**