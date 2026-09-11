import Compliance from "@/components/admin/Compliance/Compliance"
import DataEncryption from "@/components/admin/Data Encryption/DataEncryption"
import GlobalRoleManagement from "@/components/admin/security-privacy/GlobalRoleManagement"
import Session from "@/components/admin/Session/Session"

const SecurityPrivacy = () => {
  return (
    <div>
      <GlobalRoleManagement/>
      <div className="flex gap-[22px] my-8">
        <DataEncryption/>
        <Compliance/>
      </div>
      <Session/>
    </div>
  )
}

export default SecurityPrivacy