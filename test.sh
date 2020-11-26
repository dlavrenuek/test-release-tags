export IAM_RELEASE="v1.1.1-ALPHA"

if [[ $IAM_RELEASE =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-[A-Z0-9]+){0,1}$ ]]; then
  echo $IAM_RELEASE;
  echo "onprem format";
fi

if [[ $IAM_RELEASE =~ ^v[0-9]$ ]]; then
  echo $IAM_RELEASE;
  echo "saas format";
fi