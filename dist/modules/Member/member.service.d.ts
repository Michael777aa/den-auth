import { LoginInput, Member, MemberInput, MemberUpdateInput } from "../../libs/types/member";
declare class MemberService {
    private readonly memberModel;
    constructor();
    signup(input: MemberInput): Promise<any>;
    login(input: LoginInput): Promise<Member>;
    updateMember(member: Member, input: MemberUpdateInput): Promise<Member>;
    findOrCreateOAuthUser(input: MemberInput): Promise<Member>;
}
export default MemberService;
