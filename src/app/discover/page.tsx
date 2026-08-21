import { SearchDiscoveryClient } from "./SearchDiscoveryClient"
import { WalletButton } from "@/components/ui"
import styles from "./search-discovery.module.css"

export default function DiscoverPage() {
  return (
    <div className={styles.container}>
      <SearchDiscoveryClient />
      <WalletButton />
    </div>
  )
}
