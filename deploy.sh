a#!/usr/bin/env bash

# more bash-friendly output for jq
JQ="jq --raw-output --exit-status"

configure_aws_cli(){
	aws --version
	aws configure set default.region eu-central-1
	aws configure set default.output json
}

deploy_cluster() {

    family="campaigns"

    make_task_def
    register_definition
    if [[ $(aws ecs update-service --cluster besTest --service campaigns --task-definition $revision | \
                   $JQ '.service.taskDefinition') != $revision ]]; then
        echo "Error updating service."
        return 1
    fi

    # wait for older revisions to disappear
    # not really necessary, but nice for demos
    for attempt in {1..30}; do
        if stale=$(aws ecs describe-services --cluster besTest --services campaigns | \
                       $JQ ".services[0].deployments | .[] | select(.taskDefinition != \"$revision\") | .taskDefinition"); then
            echo "Waiting for stale deployments:"
            echo "$stale"
            sleep 5
        else
            echo "Deployed!"
            return 0
        fi
    done
    echo "Service update took too long."
    return 1
}

make_task_def(){
	task_template='[
		{
			"name": "campaigns",
			"image": "gr4per/campaigns:latest",
			"essential": true,
			"memory": 128,
			"cpu": 1,
      "environment": [
        {
          "name": "CONSUL_HOST",
          "value": "172.17.0.1"
        },
        {
          "name": "MYSQL_DATABASE",
          "value": "bnp"
        },
        {
          "name": "MYSQL_DIALECT",
          "value": "mysql"
        },
        {
          "name": "MYSQL_PASSWORD",
          "value": "!securePa55w0rd"
        },
        {
          "name": "MYSQL_USER",
          "value": "root"
        },
        {
          "name": "POPULATE_DATA",
          "value": "true"
        }
      ]      
		}
	]'
	
	task_def=$(printf "$task_template" $AWS_ACCOUNT_ID $CIRCLE_SHA1)
}

register_definition() {

    if revision=$(aws ecs register-task-definition --network-mode host --container-definitions "$task_def" --family $family | $JQ '.taskDefinition.taskDefinitionArn'); then
        echo "Revision: $revision"
    else
        echo "Failed to register task definition"
        return 1
    fi

}

configure_aws_cli
deploy_cluster
