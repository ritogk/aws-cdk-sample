# AWS-CDK-SAMPLE
## cdk-setup
```
cdk init app --language typescript
```

## ディレク構成
bin: エントリーポイント  
lib: インフラのコアコード  

## tsからjsにビルド
```
npm run build
```

## AWSリソースの集合を表示する
```
cdk ls
```

## CloudFormationテンプレートを生成する
```
cdk synth
```

## CDKのデプロイに使うストレージを作成する
```
cdk bootstrap
```

## すべてのスタックをデプロイ
```
cdk deploy --all
```