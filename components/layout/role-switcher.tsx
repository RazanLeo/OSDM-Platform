"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/lib/i18n/language-provider"
import { ShoppingBag, Store, ChevronDown } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

type Role = "buyer" | "seller"

export function RoleSwitcher() {
  const { t } = useLanguage()
  const router = useRouter()
  const [currentRole, setCurrentRole] = useState<Role>("buyer")

  const roles = [
    {
      value: "buyer" as Role,
      label: t.buyer,
      icon: ShoppingBag,
      href: "/dashboard/buyer",
    },
    {
      value: "seller" as Role,
      label: t.seller,
      icon: Store,
      href: "/dashboard/seller",
    },
  ]

  const handleRoleChange = (role: Role) => {
    setCurrentRole(role)
    const selectedRole = roles.find((r) => r.value === role)
    if (selectedRole) {
      router.push(selectedRole.href)
    }
  }

  const currentRoleData = roles.find((r) => r.value === currentRole)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          {currentRoleData && <currentRoleData.icon className="h-4 w-4" />}
          <span>{currentRoleData?.label}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {roles.map((role) => (
          <DropdownMenuItem
            key={role.value}
            onClick={() => handleRoleChange(role.value)}
            className={currentRole === role.value ? "bg-accent" : ""}
          >
            <role.icon className="mr-2 h-4 w-4" />
            {role.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
