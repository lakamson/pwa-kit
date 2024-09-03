/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {useState} from 'react'
import useAuthContext from './useAuthContext'
import {getDefaultCookieAttributes} from '../utils'
import Cookies from 'js-cookie'

/**
 * @group Shopper Authentication helpers
 */
interface dntInfo {
    dntNotSet: boolean | null
    updateDNT: (newValue: boolean) => Promise<void>
}

/**
 * Hook that updates the DNT preference and refreshes access token.
 *
 * @group Helpers
 * @category Shopper Authentication
 *
 */
const useDNT = (): dntInfo => {
    const auth = useAuthContext()

    const dwDntValue = Cookies.get('dw_dnt')
    const dntCookieIsDefined = dwDntValue !== '1' && dwDntValue !== '0'
    const [dntNotSet, setDntNotSet] = useState(dntCookieIsDefined)
    const updateDNT = async (newValue: boolean) => {
        // Set the cookie once to include dnt in the access token and then again to set the expiry time
        Cookies.set('dw_dnt', String(Number(newValue)), {
            ...getDefaultCookieAttributes()
        })
        setDntNotSet(false)
        await auth.refreshAccessToken()
        if (auth.get('customer_type') == 'registered') {
            console.log('(JEREMY) this is being hit')
            const daysUntilExpires = Number(auth.get('refresh_token_expires_in')) / 86400
            console.log('(JEREMY) dayUntilExpires: ', daysUntilExpires)
            Cookies.set('dw_dnt', String(Number(newValue)), {
                ...getDefaultCookieAttributes(),
                expires: daysUntilExpires
            })
        }
    }

    return {dntNotSet, updateDNT}
}

export default useDNT
