# smartcontracts-assignment

### Installation

* yarn
 ```shell
yarn
```
* test
 ```shell
yarn hardhat test
```
* deploy
 ```shell
yarn hardhat node 
yarn hardhat deploy
yarn hardhat run scripts/deploy-upgradeable_geeTokenStake.js --network localhost


```

1. 뱅킹의 통장 컨트랙을 만들어주세요.<br>
a. 사용자는 ERC20 토큰을 예치하고, 이자로 ERC20 토큰을 제공받을 수 있습니다. <br>
b. 토큰은 [컨트랙 만들기1] 에서 만든 ERC20 토큰을 사용합니다. <br>
c. 구현하는 기능은 아래와 같습니다. 필요한 다른 기능은 모두 자유롭게 정의하여
추가해주십시요. <br>
i. 예치하기<br>
ii. 이자받기<br>
iii. 인출하기<br>
<br>
> **** 

    .
    ├── ...
    ├── contracts                    # contracts folder
    │   ├── GeeToken.sol          # ERC20
    │   └── GeeTokenStake.sol         # Staking
    ├── test                    # test folder
    │   └── GeeTokenStake.test.js          # test js
    │ 
    └── ...

* test
 ```shell
yarn hardhat test ./test/GeeTokenStake.test.js 
```

<br><br>
2. [컨트랙 만들기 3] 에서 만든 컨트랙이 업그레이드 가능해야 합니다. <br>
a. 배포 후 함수를 추가/삭제할 수 있게 해주세요. ( 로직을 변경할 수 있습니다. 또는 특정 함수를
사용할 수 없도록 할 수 있습니다. 또는 특정 함수만 추가할 수 있습니다. )<br>
b. 업그레이드 후, 별도의 데이타 마이그레이션은 하지 않도록 해주세요. <br>
<br>
> **** 

    .
    ├── ...
    ├── contracts                            # contracts folder
    │   ├── proxy                            # proxy folder
    │   │   ├── GeeTokenStakeProxyAdmin.sol  # proxy admin
    │   ├── GeeToken.sol                     # ERC20
    │   ├── GeeTokenStake.sol                # Staking
    │   └── GeeTokenStakeV2.sol              # to test upgrade 
    ├── test                                 # test folder
    │   └── GeeTokenStakeUpgrades.test.js    # test js
    ├── deploy                               # deploy folder
    │   ├── 00-GeeToken.js                   # deploy ERC20
    │   ├── 01-deploy.js                     # deploy version1
    │   └── 02-deploy.js                     # deploy version2
    ├── scripts                                 # test folder
    │   └── deploy-upgradeable_geeTokenStake.test.js    # deploy js
    └── ...

* test
 ```shell
yarn hardhat test ./test/GeeTokenStakeUpgrades.test.js 
```
* deploy
 ```shell
yarn hardhat node 

yarn hardhat deploy

yarn hardhat run scripts/deploy-upgradeable_geeTokenStake.js --network localhost
```

<br>
3. [컨트랙 만들기 4] 에서 만든 컨트랙을 팩토리 컨트랙을 통해 편하게 배포할 수 있도록 해주세요. <br>
a. 배포된 컨트랙을 조회할 수 있어야 합니다. <br>
b. 여러개의 컨트랙을 배포할 수 있어야 합니다. <br>
4. [컨트랙 만들기 5] 를 통해서 배포한 모든 통장 컨트랙의 기본 로직을 변경할 수 있게 해주세요.  <br>
a. 각각의 컨트랙의 기본 로직이 아닌, 특수하게 함수를 추가하거나, 삭제한 것은 변경되지 않고, 기본
로직만 변경합니다. <br>
<br>
> **** 

    .
    ├── ...
    ├── contracts                    # contracts folder
    │   └── GeeTokenStakeFactory.sol          # Factory
    ├── test                    # test folder
    │   └── GeeTokenStakeFactory.test.js          # test js
    │ 
    └── ...

* test
 ```shell
yarn hardhat test ./test/GeeTokenStakeFactory.test.js 
```
