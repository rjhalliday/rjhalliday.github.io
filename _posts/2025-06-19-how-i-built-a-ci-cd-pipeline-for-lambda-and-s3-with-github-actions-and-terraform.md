---
layout: default
title: "How I Built a CI/CD Pipeline for Lambda and S3 with GitHub Actions and Terraform"
date: 2025-07-05
description: "How I Built a CI/CD Pipeline for Lambda and S3 with GitHub Actions and Terraform"
categories: [cicd]
tags: [aws, cicd, github]
---

# How I Built a CI/CD Pipeline for Lambda and S3 with GitHub Actions and Terraform

I've built a CI/CD pipeline that lets me push serverless application updates with confidence. It supports:

* Infrastructure as code with Terraform
* Docker-based AWS Lambda functions built from source
* A frontend deployed to S3 with environment-specific variables
* Manual promotion of verified builds from **Dev** to **Prod**, without rebuilding

In this post, I’ll explain how all the pieces fit together and how I set up the workflows to be robust, reusable, and predictable.

---

## 🔧 Repo Structure

```
.
├── backend/
│   └── <lambda-name>/         # Lambda source + Dockerfile
├── frontend/
│   ├── index.template.html    # Template with placeholders
│   └── index.html             # Generated and uploaded version
├── terraform/
│   ├── dev/                   # Dev infrastructure
│   └── prod/                  # Prod infrastructure
├── .github/workflows/         # GitHub Actions definitions
└── scripts/
    └── deploy-lambda.sh       # Local script to build and push Lambda images
```

---

## 🚀 Lambda Build and Deployment Flow

To deploy a Lambda function, I run:

```bash
./scripts/deploy-lambda.sh resumescan-nlp-yake
```

This does the following:

1. **Checks the directory** `backend/resumescan-nlp-yake` exists

2. **Validates AWS credentials** via the profile `githubactions.resumecow`

3. **Calculates a SHA-256 checksum** of the Lambda directory contents (excluding `.git`, `.pyc`, etc.) using:

   ```bash
   find ... | sort -z | xargs -0 sha256sum | sha256sum
   ```

4. **Tags the image** using the format:

   ```
   dev.<lambda-name>.<UTC timestamp>.<checksum>
   ```

   Example:

   ```
   dev.resumescan-nlp-yake.2025-07-19T05-57-59Z.7a35ac1d
   ```

5. **Builds and pushes the Docker image** to ECR, unless an image with the same checksum already exists

**Important**: The script doesn't update the Lambda function — GitHub Actions does that later using the image tag.

---

## 🔄 GitHub Workflow: Deploy to Dev

When I push to `main`, this triggers the `deploy-dev.yml` workflow — but **only if** files in `frontend/**` or `terraform/dev/**` are changed.

Here’s what the workflow does:

### 1. Provision Dev Infrastructure (Terraform)

It runs:

```bash
terraform init
terraform apply -auto-approve -var-file=terraform.tfvars
```

…in the `terraform/dev/` directory.

This ensures Lambda, API Gateway, roles, and other infra are in place.

### 2. Find Matching ECR Image

Using the same checksum method as the local build, the workflow tries to match the checksum against existing ECR image tags. If it can't find one, it exits with an error and a message like:

```
Did you forget to run ./scripts/deploy-lambda.sh resumescan-nlp-yake locally?
```

### 3. Update the Lambda Function

If a matching image is found, GitHub Actions updates the Lambda to use the image via:

```bash
aws lambda update-function-code --function-name <name> --image-uri <uri>
```

### 4. Inject Runtime Variables into Frontend

My frontend template (`index.template.html`) includes placeholders:

```html
<script>
  const API_URL = "__API_URL__";
  const GIT_SHA = "__GIT_COMMIT_SHA__";
</script>
```

In the workflow, I extract values from Terraform and Git:

```bash
sed -e "s|__API_URL__|${TERRAFORM_API_URL}|g" \
    -e "s|__GIT_COMMIT_SHA__|${GIT_COMMIT_SHA}|g" \
    frontend/index.template.html > frontend/index.html
```

This replaces the placeholders with the actual Dev API URL and Git commit hash.

### 5. Sync Frontend to S3

Once `index.html` is generated, I upload the frontend to the Dev bucket:

```bash
aws s3 sync ./frontend s3://dev.resumecow.com --delete
```

This fully mirrors the frontend directory to S3, deleting anything that no longer exists locally.

---

## ⏩ Promoting Dev to Prod

I manually trigger the `promote-to-prod.yml` workflow when I’m ready to promote a tested Dev build to Prod. Here's what it does:

### 1. Look Up the Current Dev Lambda Image

Using:

```bash
aws lambda get-function --function-name <name> --query 'Code.ImageUri'
```

This gets the exact image currently deployed in Dev.

### 2. Tag Dev Image as Prod

The workflow extracts the current tag, then re-tags it as:

```
prod.<original-dev-tag>
```

It pushes the new tag using `aws ecr put-image`.

**Why this matters**: No rebuilds, no surprises — Prod gets exactly what was tested in Dev.

### 3. Update Prod Lambda to Use Prod Tag

We then point the Prod Lambda function (e.g. `prod-resumescan-nlp-yake`) to the new image.

A check confirms that the image was applied correctly by comparing the resulting URI.

### 4. Promote Frontend from Dev to Prod

This involves a few steps:

* **Backup current Prod site** to a timestamped folder in the same bucket
* **Sync from Dev to a `_staging` folder** in Prod
* **Copy `_staging` to the root of the Prod bucket**
* **Clean up** the `_staging` folder

This ensures that I never lose production content and that changes can be tested before going live.

---

## 📦 Terraform Plan + Apply for Prod

For infrastructure changes in Prod, I follow a strict two-phase workflow:

1. `terraform-plan-for-prod.yml`

   * Copies `terraform/dev/` to `terraform/prod/`
   * Runs `terraform plan` and uploads the binary plan to S3

2. `terraform-apply-for-prod.yml`

   * Downloads the plan
   * Applies it exactly as generated

This guarantees that what gets applied has been reviewed and versioned.

---

## Lessons Learned

### Checksums Are Better Than Git SHAs

Initially, I tagged images with the Git SHA, but that caused issues when unrelated commits triggered rebuilds. Using the checksum of the Lambda source directory makes sure we only build and deploy new images when something *actually* changed.

### Don’t Trust File Ordering

`tar` gave me inconsistent checksums across machines. I fixed this by using `find -print0 | sort -z | xargs -0 sha256sum`, which preserves ordering and whitespace safety.

### Avoid Rebuilding for Prod

By promoting existing Dev images, I avoid duplicating work, ensure consistency, and reduce the chance of introducing last-minute bugs.

---

## Final Thoughts

This setup gives me a fully automated Dev deploy and a controlled, safe path to promote that exact build to Prod. It supports rollback (via backups), reproducibility (via image tags and Terraform state), and visibility into what’s running where.

Let me know if you’d like to see examples of the actual Terraform or Docker setup behind this pipeline.
