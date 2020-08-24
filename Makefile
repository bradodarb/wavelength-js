SHELL:=/bin/bash

stage ?= sandbox
account ?= sandbox



.PHONY: check
check: lint test

.PHONY: clean
clean:
	find . -name '*.pyc' -delete
	find . -name '__pycache__' -delete
	rm -rf .coverage
	rm -rf coverage
	rm -rf htmlcov
	rm -rf .pytest_cache
	rm -rf .cache
	rm -rf .serverless

.PHONY: lint
lint:
	docker-compose run --rm app yarn lint

.PHONY: type
type:
	docker-compose run --rm app yarn tsc
.PHONY: test
test:
	docker-compose run --rm -e test_stage=${stage} app yarn coverage --maxWorkers=2
.PHONY: check
check: lint type test
