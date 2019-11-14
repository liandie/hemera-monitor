# hemera-monitor
hemera服务监控

### 需要安装jaeger服务
通过 `Docker` 容器安装，所以需要先安装 `Docker`,这里以 `Ubuntu 16.4` 系统为安装实例

####  Docker安装

- 卸载旧版本Docker，全新安装时，无需执行该步骤
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

- 添加官方密钥，执行该命令时，如遇到长时间没有响应说明网络连接不到Docker网站，需要使用代-理进行。
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

- 安装Docker，如果想指定安装某一版本，可使用 `sudo apt-get install docker-ce=<VERSION>`  命令，把<VERSION>替换为具体版本即可，以下命令没有指定版本，默认就会安装最新版
  ```sh
  sudo apt-get install docker-ce
  ```

- 查看Docker版本
  ```sh
  docker -v #显示“Docker version 17.09.0-ce, build afdb6d4”字样，表示安装成功
  ```

- 修改Docker 镜像路径，首先停止docker服务
  ```sh
  sudo service docker stop
  ```

- 进入 docker.service.d中，docker.service.d 如果没有请自行创建；
  ```sh
  cd etc/systemd/system/docker.service.d
  ```

- 修改 docker-overlay.conf 文件，如果没有请自行创建；
  ```sh
  sudo vim docker-overlay.conf
  ```

- 在文件中添加内容
  ```sh
  [Service]
  ExecStart=
  ExecStart=/usr/bin/dockerd --graph="你的路径" --storage-driver=overlay
  ```

- 重启docker
  ```sh
  systemctl daemon-reload
  sudo service docker start
  ```

- 查看docker 信息，确认是否已经修改成功
  ```sh
  sudo docker info
  #Docker Root Dir:你的镜像路径
  ```

- 由于默认镜像源是国外的，下载容器可能会很慢，所以这里需要更换镜像源，国内亲测可用的几个镜像源：
>>> Docker 官方中国区：https://registry.docker-cn.com

>>> 网易：http://hub-mirror.c.163.com

>>> 中国科技大学：https://docker.mirrors.ustc.edu.cn

>>> 阿里云：https://y0qd3iq.mirror.aliyuncs.com

- 增加Docker的镜像源配置文件 /etc/docker/daemon.json，如果没有配置过镜像该文件默认是不存的

  ```sh
  cd /etc/docker/
  vim daemon.json 
  # 在其中增加如下内容：
  {
    "registry-mirrors": ["https://y0qd3iq.mirror.aliyuncs.com"]
  }
  ```

- 然后重启Docker服务：
  ```sh
  service docker restart
  ```

- 然后通过以下命令查看配置是否生效
  ```sh
  docker info|grep Mirrors -A 1
  # 可以看到如下的输出：
  Registry Mirrors:
  https://y0qd3iq.mirror.aliyuncs.com/
  # 就表示镜像配置成功，然后再执行docker pull操作，就会很快了。
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

**利用 `ElasticSearch` 作为存储引擎部署 `jaeger`**

- 拉取镜像
  ```sh
  docker pull docker.elastic.co/elasticsearch/elasticsearch:7.2.1
  ```

- 运行容器 `ElasticSearch` 的默认端口是 `9200`，我们把宿主环境 `9200` 端口映射到 `Docker` 容器中的 `9200` 端口，就可以访问到 `Docker` 容器中的 `ElasticSearch` 服务了，同时我们把这个容器命名为 `es`
  ```sh
  docker run -d --name es -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.2.1
  ```

- 创建容器时添加参数 `--restart=always` 后，当 `Docker` 重启时，容器自动启动，创建完容器也可以设置，使用方法
  ```sh
  docker container update --restart=always 容器名字
  ```

- 配置跨域，进入容器，由于要进行配置，因此需要进入容器当中修改相应的配置信息
  ```sh
  docker exec -it 上面创建容器的名字 /bin/bash
  ```
- 进行配置
```sh
  # 显示文件
  ls
  结果如下：
  LICENSE.txt  README.textile  config  lib   modules
  NOTICE.txt   bin             data    logs  plugins

  # 进入配置文件夹
  cd config

  # 显示文件
  ls
  结果如下：
  elasticsearch.keystore  ingest-geoip  log4j2.properties  roles.yml  users_roles
  elasticsearch.yml       jvm.options   role_mapping.yml   users

  # 修改配置文件
  vi elasticsearch.yml

  # 加入跨域配置
  http.cors.enabled: true
  http.cors.allow-origin: "*"
  path.data: /path/to/data1,/path/to/data2 #存储路径，可以是多个
  path.logs: /path/to/logs
  path.plugins: /path/to/plugins
  ```

- 重启容器，由于修改了配置，因此需要重启ElasticSearch容器
  ```sh
  docker restart es
  ```

**Docker 部署 ElasticSearch-Head**

- 为什么要安装ElasticSearch-Head呢，原因是需要有一个管理界面进行查看ElasticSearch相关信息，拉取镜像
  ```sh
  docker pull mobz/elasticsearch-head:5
  ```

- 运行容器
  ```sh
  docker run -d --name es_admin -p 9100:9100 mobz/elasticsearch-head:5
  ```

- 访问管理页面，地址栏输入你的IP://9100就可以看到管理页面
![管理页面](管理页面.png "管理页面")

**ElasticSearch更详细的配置请查看官网或后期更新配置参数说明**