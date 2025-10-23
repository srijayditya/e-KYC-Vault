async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const KycVault = await ethers.getContractFactory("KycVault");
  const contract = await KycVault.deploy();

  await contract.waitForDeployment();
  console.log("Deployed at:", await contract.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
