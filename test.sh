export IAM_RELEASE="v1.2.123"

if ! [[ $IAM_RELEASE =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo $IAM_RELEASE;
  echo "wrong format";
fi